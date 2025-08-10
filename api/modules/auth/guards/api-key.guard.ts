import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RedisService } from '../../redis/redis.service';
import { ApiKey, User } from '@prisma/client';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKeyFromRequest(request);

    if (!apiKey) {
      throw new UnauthorizedException('API Key manquante');
    }

    // Vérifier le rate limiting
    const rateLimitKey = `rate_limit:${apiKey}`;
    const currentCount = await this.redisService.get(rateLimitKey);
    
    // Valider l'API Key
    const validApiKey = await this.authService.validateApiKey(apiKey);
    
    if (!validApiKey) {
      throw new UnauthorizedException('API Key invalide ou expirée');
    }

    // Vérifier le rate limiting (limite par défaut)
    const hourlyLimit = 100; // Limite par défaut
    if (currentCount && parseInt(currentCount as string) >= hourlyLimit) {
      throw new UnauthorizedException(`Rate limit dépassé: ${hourlyLimit} requêtes/heure`);
    }

    // Incrémenter le compteur de rate limiting
    await this.redisService.set(rateLimitKey, (parseInt(currentCount as string || '0') + 1).toString(), 3600);

    // Ajouter les informations de l'API Key à la requête
    request.apiKey = validApiKey;
    request.user = (validApiKey as any).user;

    return true;
  }

  private extractApiKeyFromRequest(request: any): string | null {
    // Vérifier dans les headers
    const headerKey = request.headers['x-api-key'] || request.headers['authorization'];
    if (headerKey) {
      // Si c'est dans Authorization, extraire après "Bearer "
      if (headerKey.startsWith('Bearer ')) {
        return headerKey.substring(7);
      }
      return headerKey;
    }

    // Vérifier dans les query parameters
    const queryKey = request.query?.api_key || request.query?.apikey;
    if (queryKey) {
      return queryKey;
    }

    return null;
  }
}
