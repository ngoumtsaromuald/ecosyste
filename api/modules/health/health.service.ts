import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Obtenir le statut de santé général
   */
  async getHealthStatus() {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;

    const [databaseStatus, redisStatus] = await Promise.allSettled([
      this.getDatabaseHealth(),
      this.getRedisHealth(),
    ]);

    const dbHealth = databaseStatus.status === 'fulfilled' ? databaseStatus.value : { status: 'error' };
    const redisHealth = redisStatus.status === 'fulfilled' ? redisStatus.value : { status: 'error' };

    const overallStatus = dbHealth.status === 'ok' && redisHealth.status === 'ok' ? 'ok' : 'error';

    return {
      status: overallStatus,
      timestamp,
      uptime,
      services: {
        database: dbHealth.status,
        redis: redisHealth.status,
      },
      details: {
        database: dbHealth,
        redis: redisHealth,
      },
    };
  }

  /**
   * Vérifier la santé de Redis
   */
  async getRedisHealth() {
    try {
      const startTime = Date.now();
      const isHealthy = await this.redisService.healthCheck();
      const latency = Date.now() - startTime;

      if (!isHealthy) {
        return {
          status: 'error',
          connected: false,
          latency,
          error: 'Redis ping failed',
        };
      }

      return {
        status: 'ok',
        connected: true,
        latency,
      };
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return {
        status: 'error',
        connected: false,
        error: error.message,
      };
    }
  }

  /**
   * Vérifier la santé de la base de données
   */
  async getDatabaseHealth() {
    try {
      const startTime = Date.now();
      
      // Test simple de connexion à la base de données
      await this.prismaService.$queryRaw`SELECT 1`;
      
      const latency = Date.now() - startTime;

      return {
        status: 'ok',
        connected: true,
        latency,
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'error',
        connected: false,
        latency: null,
        error: error.message,
      };
    }
  }

  /**
   * Obtenir des métriques détaillées
   */
  async getDetailedMetrics() {
    try {
      const [businessCount, userCount, categoryCount] = await Promise.all([
        this.prismaService.business.count(),
        this.prismaService.user.count(),
        this.prismaService.category.count(),
      ]);

      return {
        database: {
          businesses: businessCount,
          users: userCount,
          categories: categoryCount,
        },
        system: {
          uptime: Date.now() - this.startTime,
          memory: process.memoryUsage(),
          nodeVersion: process.version,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get detailed metrics:', error);
      throw error;
    }
  }
}
