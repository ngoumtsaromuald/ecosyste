import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, LoginDto, RegisterDto, AuthResponse } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User, ApiPlan } from '@prisma/client';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer le profil utilisateur' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur' })
  async getProfile(@CurrentUser() user: User): Promise<Omit<User, 'password'>> {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('api-keys')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister les API Keys de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Liste des API Keys' })
  async getApiKeys(@CurrentUser('id') userId: string) {
    return this.authService.getUserApiKeys(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api-keys')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle API Key' })
  @ApiResponse({ status: 201, description: 'API Key créée' })
  async createApiKey(
    @CurrentUser('id') userId: string,
    @Body() createApiKeyDto: { name: string; plan?: ApiPlan; expiresAt?: string },
  ) {
    const { name, plan = ApiPlan.FREE, expiresAt } = createApiKeyDto;
    const expirationDate = expiresAt ? new Date(expiresAt) : undefined;
    
    return this.authService.createApiKey(userId, name, plan, expirationDate);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('api-keys/:keyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Révoquer une API Key' })
  @ApiResponse({ status: 204, description: 'API Key révoquée' })
  async revokeApiKey(
    @CurrentUser('id') userId: string,
    @Param('keyId') keyId: string,
  ): Promise<void> {
    return this.authService.revokeApiKey(keyId, userId);
  }
}
