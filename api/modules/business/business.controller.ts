import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { BusinessService } from './business.service';
import { RedisService } from '../redis/redis.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { IngestBusinessDto } from './dto/ingest-business.dto';
import { BusinessQueryDto } from './dto/business-query.dto';
import { BusinessEntity, BusinessListResponse, IngestionResponse } from './entities/business.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Businesses')
@Controller('businesses')
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Créer une nouvelle entreprise (authentification requise)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.BUSINESS, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Créer une nouvelle entreprise',
    description: 'Permet à un utilisateur authentifié de créer une nouvelle entreprise dans le catalogue.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Entreprise créée avec succès',
    type: BusinessEntity
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
    @Request() req: any
  ): Promise<BusinessEntity> {
    return this.businessService.create(createBusinessDto, req.user.id);
  }

  /**
   * Récupérer toutes les entreprises avec filtres et pagination
   */
  @Public()
  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ 
    summary: 'Lister les entreprises',
    description: 'Récupère la liste des entreprises avec possibilité de filtrage, recherche et pagination.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'éléments par page (défaut: 20, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Recherche textuelle dans nom et description' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filtrer par catégorie (ID ou slug)' })
  @ApiQuery({ name: 'city', required: false, type: String, description: 'Filtrer par ville' })
  @ApiQuery({ name: 'region', required: false, type: String, description: 'Filtrer par région' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'PENDING', 'SUSPENDED'], description: 'Filtrer par statut' })
  @ApiQuery({ name: 'plan', required: false, enum: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'], description: 'Filtrer par plan' })
  @ApiQuery({ name: 'featured', required: false, type: Boolean, description: 'Filtrer les entreprises mises en avant' })
  @ApiQuery({ name: 'latitude', required: false, type: Number, description: 'Latitude pour recherche géographique' })
  @ApiQuery({ name: 'longitude', required: false, type: Number, description: 'Longitude pour recherche géographique' })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Rayon de recherche en km (défaut: 10)' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['name', 'createdAt', 'viewCount', 'featured', 'distance'], description: 'Champ de tri' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Ordre de tri (défaut: desc)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des entreprises récupérée avec succès',
    type: BusinessListResponse
  })
  async findAll(@Query() query: BusinessQueryDto): Promise<BusinessListResponse> {
    return this.businessService.findAll(query);
  }

  /**
   * Récupérer une entreprise par ID
   */
  @Public()
  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ 
    summary: 'Récupérer une entreprise',
    description: 'Récupère les détails d\'une entreprise par son ID. Incrémente automatiquement le compteur de vues.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Entreprise trouvée',
    type: BusinessEntity
  })
  @ApiResponse({ status: 404, description: 'Entreprise introuvable' })
  async findOne(@Param('id') id: string): Promise<BusinessEntity> {
    return this.businessService.findOne(id);
  }

  /**
   * Mettre à jour une entreprise (propriétaire ou admin)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.BUSINESS, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Mettre à jour une entreprise',
    description: 'Permet au propriétaire ou à un administrateur de mettre à jour les informations d\'une entreprise.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Entreprise mise à jour avec succès',
    type: BusinessEntity
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Entreprise introuvable' })
  async update(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @Request() req: any
  ): Promise<BusinessEntity> {
    const ownerId = req.user.role === UserRole.ADMIN ? undefined : req.user.id;
    return this.businessService.update(id, updateBusinessDto, ownerId);
  }

  /**
   * Supprimer une entreprise (propriétaire ou admin)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.BUSINESS, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Supprimer une entreprise',
    description: 'Permet au propriétaire ou à un administrateur de supprimer une entreprise du catalogue.'
  })
  @ApiResponse({ status: 204, description: 'Entreprise supprimée avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Entreprise introuvable' })
  async remove(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<void> {
    const ownerId = req.user.role === UserRole.ADMIN ? undefined : req.user.id;
    return this.businessService.remove(id, ownerId);
  }

  /**
   * Endpoint d'ingestion pour n8n (API Key requise)
   */
  @UseGuards(ApiKeyGuard)
  @Post('ingest')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Ingestion de données d\'entreprise',
    description: 'Endpoint sécurisé pour l\'ingestion automatique de données d\'entreprises depuis les workflows n8n.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Ingestion réussie',
    type: IngestionResponse
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'API Key invalide' })
  async ingest(@Body() ingestBusinessDto: IngestBusinessDto): Promise<IngestionResponse> {
    return this.businessService.ingest(ingestBusinessDto);
  }

  /**
   * Récupérer les statistiques d'une entreprise (propriétaire ou admin)
   */
  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.BUSINESS, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Statistiques d\'une entreprise',
    description: 'Récupère les statistiques détaillées d\'une entreprise (vues, clics, etc.).'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        businessId: { type: 'string' },
        viewCount: { type: 'number' },
        clickCount: { type: 'number' },
        lastViewed: { type: 'string', format: 'date-time' },
        monthlyViews: { type: 'array', items: { type: 'object' } },
        topReferrers: { type: 'array', items: { type: 'string' } },
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Entreprise introuvable' })
  async getStats(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const business = await this.businessService.findOne(id);
    
    // Vérifier la propriété si pas admin
    if (req.user.role !== UserRole.ADMIN && business.ownerId !== req.user.id) {
      throw new Error('Accès refusé');
    }

    // Récupérer les statistiques depuis Redis
    const redisStats = await this.redisService.getBusinessStats(id, 30); // 30 derniers jours

    return {
      businessId: id,
      viewCount: business.viewCount,
      clickCount: business.clickCount,
      lastViewed: business.updatedAt,
      dailyViews: redisStats.views,
      dailyCalls: redisStats.calls,
      dailyWebsiteClicks: redisStats.websiteClicks,
      totalDailyViews: redisStats.views.reduce((sum, count) => sum + count, 0),
      totalDailyCalls: redisStats.calls.reduce((sum, count) => sum + count, 0),
      totalDailyWebsiteClicks: redisStats.websiteClicks.reduce((sum, count) => sum + count, 0),
    };
  }

  /**
   * Incrémenter le compteur d'appels téléphoniques
   */
  @Public()
  @Post(':id/call')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Enregistrer un appel téléphonique',
    description: 'Incrémente le compteur d\'appels pour une entreprise.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Appel enregistré avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        callCount: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Entreprise introuvable' })
  async recordCall(@Param('id') id: string) {
    // Vérifier que l'entreprise existe
    await this.businessService.findOne(id);
    
    // Incrémenter le compteur dans Redis
    const callCount = await this.redisService.incrementCallCount(id);
    
    return {
      success: true,
      callCount
    };
  }

  /**
   * Incrémenter le compteur de clics sur le site web
   */
  @Public()
  @Post(':id/website-click')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Enregistrer un clic sur le site web',
    description: 'Incrémente le compteur de clics sur le site web pour une entreprise.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Clic enregistré avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        websiteClickCount: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Entreprise introuvable' })
  async recordWebsiteClick(@Param('id') id: string) {
    // Vérifier que l'entreprise existe
    await this.businessService.findOne(id);
    
    // Incrémenter le compteur dans Redis
    const websiteClickCount = await this.redisService.incrementWebsiteClickCount(id);
    
    return {
      success: true,
      websiteClickCount
    };
  }

  /**
   * Marquer une entreprise comme mise en avant (admin seulement)
   */
  @Patch(':id/feature')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Mettre en avant une entreprise',
    description: 'Permet à un administrateur de marquer une entreprise comme mise en avant.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Entreprise mise en avant avec succès',
    type: BusinessEntity
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  @ApiResponse({ status: 404, description: 'Entreprise introuvable' })
  async toggleFeatured(
    @Param('id') id: string,
    @Body('featured') featured: boolean
  ): Promise<BusinessEntity> {
    return this.businessService.update(id, { featured });
  }
}
