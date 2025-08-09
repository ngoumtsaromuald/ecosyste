import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Vérification de santé générale
   */
  @Get()
  @ApiOperation({ 
    summary: 'Vérification de santé de l\'API',
    description: 'Vérifie le statut de l\'API et de ses dépendances (base de données, Redis, etc.)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statut de santé de l\'API',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ok', 'error'] },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number' },
        services: {
          type: 'object',
          properties: {
            database: { type: 'string', enum: ['ok', 'error'] },
            redis: { type: 'string', enum: ['ok', 'error'] }
          }
        }
      }
    }
  })
  async getHealth() {
    return this.healthService.getHealthStatus();
  }

  /**
   * Vérification de santé de Redis
   */
  @Get('redis')
  @ApiOperation({ 
    summary: 'Vérification de santé de Redis',
    description: 'Vérifie spécifiquement le statut de la connexion Redis'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statut de Redis',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ok', 'error'] },
        connected: { type: 'boolean' },
        latency: { type: 'number' },
        memory: { type: 'object' }
      }
    }
  })
  async getRedisHealth() {
    return this.healthService.getRedisHealth();
  }

  /**
   * Vérification de santé de la base de données
   */
  @Get('database')
  @ApiOperation({ 
    summary: 'Vérification de santé de la base de données',
    description: 'Vérifie spécifiquement le statut de la connexion à la base de données'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statut de la base de données',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ok', 'error'] },
        connected: { type: 'boolean' },
        latency: { type: 'number' }
      }
    }
  })
  async getDatabaseHealth() {
    return this.healthService.getDatabaseHealth();
  }
}
