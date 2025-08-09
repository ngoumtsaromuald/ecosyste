import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(ConfigService) private configService: ConfigService,
  ) {
    this.initializeRedisClient();
  }

  private initializeRedisClient() {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    
    this.redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redisClient.on('connect', () => {
      this.logger.log('Redis client connected');
    });

    this.redisClient.on('error', (error) => {
      this.logger.error('Redis client error:', error);
    });
  }

  // Méthodes de cache génériques
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.cacheManager.get<T>(key);
      return result ?? null;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  async reset(): Promise<void> {
    try {
      if ('reset' in this.cacheManager && typeof this.cacheManager.reset === 'function') {
        await this.cacheManager.reset();
      } else {
        // Fallback: clear all keys manually
        const keys = await this.redisClient.keys('*');
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      }
    } catch (error) {
      this.logger.error('Error resetting cache:', error);
    }
  }

  // Méthodes spécifiques pour les businesses
  async cacheBusinesses(businesses: any[], filters: any = {}, ttl: number = 300): Promise<void> {
    const cacheKey = this.generateBusinessesCacheKey(filters);
    await this.set(cacheKey, businesses, ttl);
  }

  async getCachedBusinesses(filters: any = {}): Promise<any[] | null> {
    const cacheKey = this.generateBusinessesCacheKey(filters);
    return await this.get<any[]>(cacheKey);
  }

  async cacheBusiness(businessId: string, business: any, ttl: number = 600): Promise<void> {
    const cacheKey = `business:${businessId}`;
    await this.set(cacheKey, business, ttl);
  }

  async getCachedBusiness(businessId: string): Promise<any | null> {
    const cacheKey = `business:${businessId}`;
    return await this.get<any>(cacheKey);
  }

  async invalidateBusinessCache(businessId?: string): Promise<void> {
    if (businessId) {
      // Invalider le cache d'une entreprise spécifique
      await this.del(`business:${businessId}`);
    }
    
    // Invalider tous les caches de listes d'entreprises
    const pattern = 'businesses:*';
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
    } catch (error) {
      this.logger.error('Error invalidating business cache:', error);
    }
  }

  // Méthodes pour les sessions utilisateur
  async setUserSession(userId: string, sessionData: any, ttl: number = 3600): Promise<void> {
    const sessionKey = `session:${userId}`;
    await this.set(sessionKey, sessionData, ttl);
  }

  async getUserSession(userId: string): Promise<any | null> {
    const sessionKey = `session:${userId}`;
    return await this.get<any>(sessionKey);
  }

  async deleteUserSession(userId: string): Promise<void> {
    const sessionKey = `session:${userId}`;
    await this.del(sessionKey);
  }

  // Méthodes pour les statistiques et analytics
  async incrementViewCount(businessId: string): Promise<number> {
    const key = `views:${businessId}:${this.getCurrentDateKey()}`;
    try {
      const count = await this.redisClient.incr(key);
      // Expirer après 24 heures
      await this.redisClient.expire(key, 86400);
      return count;
    } catch (error) {
      this.logger.error(`Error incrementing view count for ${businessId}:`, error);
      return 0;
    }
  }

  async incrementCallCount(businessId: string): Promise<number> {
    const key = `calls:${businessId}:${this.getCurrentDateKey()}`;
    try {
      const count = await this.redisClient.incr(key);
      await this.redisClient.expire(key, 86400);
      return count;
    } catch (error) {
      this.logger.error(`Error incrementing call count for ${businessId}:`, error);
      return 0;
    }
  }

  async incrementWebsiteClickCount(businessId: string): Promise<number> {
    const key = `website_clicks:${businessId}:${this.getCurrentDateKey()}`;
    try {
      const count = await this.redisClient.incr(key);
      await this.redisClient.expire(key, 86400);
      return count;
    } catch (error) {
      this.logger.error(`Error incrementing website click count for ${businessId}:`, error);
      return 0;
    }
  }

  async getBusinessStats(businessId: string, days: number = 7): Promise<any> {
    const stats: {
      views: number[];
      calls: number[];
      websiteClicks: number[];
    } = {
      views: [],
      calls: [],
      websiteClicks: [],
    };

    try {
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = this.getDateKey(date);

        const [views, calls, websiteClicks] = await Promise.all([
          this.redisClient.get(`views:${businessId}:${dateKey}`),
          this.redisClient.get(`calls:${businessId}:${dateKey}`),
          this.redisClient.get(`website_clicks:${businessId}:${dateKey}`),
        ]);

        stats.views.unshift(parseInt(views || '0'));
        stats.calls.unshift(parseInt(calls || '0'));
        stats.websiteClicks.unshift(parseInt(websiteClicks || '0'));
      }
    } catch (error) {
      this.logger.error(`Error getting business stats for ${businessId}:`, error);
    }

    return stats;
  }

  // Méthodes pour la limitation de taux (rate limiting)
  async checkRateLimit(identifier: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number }> {
    const key = `rate_limit:${identifier}`;
    const window = Math.floor(Date.now() / windowMs);
    const windowKey = `${key}:${window}`;

    try {
      const current = await this.redisClient.incr(windowKey);
      
      if (current === 1) {
        await this.redisClient.expire(windowKey, Math.ceil(windowMs / 1000));
      }

      const allowed = current <= limit;
      const remaining = Math.max(0, limit - current);

      return { allowed, remaining };
    } catch (error) {
      this.logger.error(`Error checking rate limit for ${identifier}:`, error);
      return { allowed: true, remaining: limit };
    }
  }

  // Méthodes utilitaires privées
  private generateBusinessesCacheKey(filters: any): string {
    const filterString = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    
    return `businesses:${Buffer.from(filterString).toString('base64')}`;
  }

  private getCurrentDateKey(): string {
    return this.getDateKey(new Date());
  }

  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  }

  // Méthode pour vérifier la santé de Redis
  async healthCheck(): Promise<boolean> {
    try {
      await this.redisClient.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  // Nettoyage lors de la destruction du service
  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}
