import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { ApiKey, User } from '@prisma/client';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: Request): Promise<{ apiKey: ApiKey; user: User }> {
    const apiKey = this.extractApiKey(req);
    
    if (!apiKey) {
      throw new UnauthorizedException('API Key manquante');
    }

    const validApiKey = await this.authService.validateApiKey(apiKey);
    
    if (!validApiKey) {
      throw new UnauthorizedException('API Key invalide ou expirée');
    }

    // Retourner les informations de l'API Key et de l'utilisateur
    return {
      apiKey: validApiKey,
      user: (validApiKey as any).user,
    };
  }

  private extractApiKey(req: Request): string | null {
    // Chercher dans l'en-tête Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Chercher dans l'en-tête X-API-Key
    const apiKeyHeader = req.headers['x-api-key'];
    if (apiKeyHeader && typeof apiKeyHeader === 'string') {
      return apiKeyHeader;
    }

    // Chercher dans les paramètres de requête
    const apiKeyQuery = req.query.api_key;
    if (apiKeyQuery && typeof apiKeyQuery === 'string') {
      return apiKeyQuery;
    }

    return null;
  }
}
