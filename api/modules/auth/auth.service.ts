import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { User, ApiKey, UserRole, ApiPlan } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, name, role = UserRole.USER } = registerDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    // Générer les tokens
    const tokens = await this.generateTokens(user);

    this.logger.log(`Nouvel utilisateur inscrit: ${email}`);

    return {
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Trouver l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Générer les tokens
    const tokens = await this.generateTokens(user);

    this.logger.log(`Utilisateur connecté: ${email}`);

    return {
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  /**
   * Valider un utilisateur par JWT payload
   */
  async validateUser(payload: JwtPayload): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return null;
    }

    return this.excludePassword(user);
  }

  /**
   * Valider une API Key
   */
  async validateApiKey(key: string): Promise<ApiKey | null> {
    const hashedKey = this.hashApiKey(key);
    
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { 
        key: hashedKey,
        isActive: true,
      },
      include: {
        user: true,
      },
    });

    if (!apiKey) {
      return null;
    }

    // Vérifier la date d'expiration
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    // Mettre à jour la dernière utilisation
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { 
        lastUsedAt: new Date(),
        usageCount: { increment: 1 },
      },
    });

    return apiKey;
  }

  /**
   * Créer une nouvelle API Key
   */
  async createApiKey(
    userId: string,
    name: string,
    plan: ApiPlan = ApiPlan.FREE,
    expiresAt?: Date
  ): Promise<{ apiKey: ApiKey; plainKey: string }> {
    // Générer une clé aléatoire
    const plainKey = this.generateApiKey();
    const hashedKey = this.hashApiKey(plainKey);

    // Définir les limites selon le plan
    const limits = this.getApiLimits(plan);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        name,
        key: hashedKey,
        plan,
        userId,
        expiresAt,
        rateLimit: limits.rateLimit,
        quotaLimit: limits.quotaLimit,
      },
    });

    this.logger.log(`Nouvelle API Key créée: ${name} pour utilisateur ${userId}`);

    return { apiKey, plainKey };
  }

  /**
   * Révoquer une API Key
   */
  async revokeApiKey(keyId: string, userId: string): Promise<void> {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId,
      },
    });

    if (!apiKey) {
      throw new BadRequestException('API Key introuvable');
    }

    await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });

    this.logger.log(`API Key révoquée: ${keyId}`);
  }

  /**
   * Lister les API Keys d'un utilisateur
   */
  async getUserApiKeys(userId: string): Promise<Omit<ApiKey, 'key'>[]> {
    const apiKeys = await this.prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        plan: true,
        isActive: true,
        createdAt: true,
        expiresAt: true,
        lastUsedAt: true,
        usageCount: true,
        rateLimit: true,
        quotaLimit: true,
        userId: true,
      },
    });

    return apiKeys;
  }

  /**
   * Générer les tokens JWT
   */
  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken?: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  /**
   * Exclure le mot de passe des données utilisateur
   */
  private excludePassword(user: User): Omit<User, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Générer une API Key aléatoire
   */
  private generateApiKey(): string {
    const prefix = 'rapi_';
    const randomPart = randomBytes(32).toString('hex');
    return `${prefix}${randomPart}`;
  }

  /**
   * Hasher une API Key
   */
  private hashApiKey(key: string): string {
    return bcrypt.hashSync(key, 10);
  }

  /**
   * Obtenir les limites selon le plan API
   */
  private getApiLimits(plan: ApiPlan): { rateLimit: number; quotaLimit: number } {
    switch (plan) {
      case ApiPlan.FREE:
        return { rateLimit: 100, quotaLimit: 1000 }; // 100 req/h, 1000 req/mois
      case ApiPlan.BASIC:
        return { rateLimit: 500, quotaLimit: 10000 }; // 500 req/h, 10k req/mois
      case ApiPlan.PRO:
        return { rateLimit: 2000, quotaLimit: 100000 }; // 2k req/h, 100k req/mois
      case ApiPlan.ENTERPRISE:
        return { rateLimit: 10000, quotaLimit: 1000000 }; // 10k req/h, 1M req/mois
      default:
        return { rateLimit: 100, quotaLimit: 1000 };
    }
  }
}
