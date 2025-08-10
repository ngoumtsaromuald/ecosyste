import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { IngestBusinessDto } from './dto/ingest-business.dto';
import { BusinessQueryDto } from './dto/business-query.dto';
import { BusinessEntity, BusinessListResponse, IngestionResponse } from './entities/business.entity';
import { Prisma, BusinessStatus, IngestionStatus } from '../../../generated/prisma';
import slugify from 'slugify';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /**
   * Créer une nouvelle entreprise
   */
  async create(createBusinessDto: CreateBusinessDto, ownerId: string): Promise<BusinessEntity> {
    const slug = await this.generateUniqueSlug(createBusinessDto.name);

    // Vérifier que la catégorie existe
    const category = await this.prisma.category.findUnique({
      where: { id: createBusinessDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Catégorie introuvable');
    }

    const business = await this.prisma.business.create({
      data: {
        ...createBusinessDto,
        slug,
        ownerId,
      },
      include: {
        category: true,
      },
    });

    this.logger.log(`Nouvelle entreprise créée: ${business.name} (${business.id})`);
    return business as BusinessEntity;
  }

  /**
   * Récupérer toutes les entreprises avec filtres et pagination
   */
  async findAll(query: BusinessQueryDto): Promise<BusinessListResponse> {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      city, 
      region, 
      status, 
      plan, 
      featured, 
      latitude, 
      longitude, 
      radius, 
      sortBy, 
      sortOrder 
    } = query;
    
    // Vérifier le cache Redis d'abord
    const cachedResult = await this.redisService.getCachedBusinesses(query);
    if (cachedResult) {
      this.logger.debug('Résultats récupérés depuis le cache Redis');
      return cachedResult as unknown as BusinessListResponse;
    }
    
    const skip = (page - 1) * limit;
    const where: Prisma.BusinessWhereInput = {};

    // Filtres de recherche textuelle
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtres par catégorie (ID ou slug)
    if (category) {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
      ];
    }

    // Filtres géographiques
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (region) where.region = { contains: region, mode: 'insensitive' };

    // Filtres de statut
    if (status) where.status = status;
    if (plan) where.plan = plan;
    if (featured !== undefined) where.featured = featured;

    // Recherche géographique (approximative avec Prisma)
    if (latitude && longitude && radius) {
      const latRange = radius / 111; // 1 degré ≈ 111 km
      const lonRange = radius / (111 * Math.cos(latitude * Math.PI / 180));
      
      where.AND = [
        { latitude: { gte: latitude - latRange, lte: latitude + latRange } },
        { longitude: { gte: longitude - lonRange, lte: longitude + lonRange } },
      ];
    }

    // Tri
    const orderBy: Prisma.BusinessOrderByWithRelationInput = {};
    if (sortBy === 'name') orderBy.name = sortOrder;
    else if (sortBy === 'createdAt') orderBy.createdAt = sortOrder;
    else if (sortBy === 'viewCount') orderBy.viewCount = sortOrder;
    else if (sortBy === 'featured') orderBy.featured = sortOrder;
    else orderBy.createdAt = 'desc';

    // Requêtes parallèles pour les données et le total
    const [businesses, total] = await Promise.all([
      this.prisma.business.findMany({
        where: where as any,
        include: {
          category: true,
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.business.count({ where: where as any }),
    ]);

    // Calcul de distance si recherche géographique
    const businessesWithDistance = businesses.map(business => {
      let distance: number | undefined;
      if (latitude && longitude && business.latitude && business.longitude) {
        distance = this.calculateDistance(
          latitude, longitude,
          business.latitude, business.longitude
        );
      }
      return { 
        ...business, 
        distance
      };
    }) as unknown as BusinessEntity[];

    // Tri par distance si demandé
    if (sortBy === 'distance' && latitude && longitude) {
      businessesWithDistance.sort((a, b) => {
        const distA = a.distance || Infinity;
        const distB = b.distance || Infinity;
        return sortOrder === 'asc' ? distA - distB : distB - distA;
      });
    }

    const totalPages = Math.ceil(total / limit);

    const result = {
      data: businessesWithDistance,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    // Mettre en cache le résultat (TTL: 5 minutes)
    await this.redisService.cacheBusinesses(result.data, query, 300);
    this.logger.debug('Résultats mis en cache Redis');

    return result;
  }

  /**
   * Récupérer une entreprise par ID
   */
  async findOne(id: string): Promise<BusinessEntity> {
    // Vérifier le cache Redis d'abord
    const cachedBusiness = await this.redisService.getCachedBusiness(id);
    if (cachedBusiness) {
      this.logger.debug(`Entreprise ${id} récupérée depuis le cache Redis`);
      // Incrémenter le compteur de vues dans Redis
      await this.redisService.incrementViewCount(id);
      return cachedBusiness as BusinessEntity;
    }

    const business = await this.prisma.business.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!business) {
      throw new NotFoundException('Entreprise introuvable');
    }

    // Incrémenter le compteur de vues dans la base de données
    await this.prisma.business.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Incrémenter aussi dans Redis pour les analytics
    await this.redisService.incrementViewCount(id);

    // Mettre en cache l'entreprise (TTL: 10 minutes)
    await this.redisService.cacheBusiness(id, business, 600);
    this.logger.debug(`Entreprise ${id} mise en cache Redis`);

    return business as BusinessEntity;
  }

  /**
   * Mettre à jour une entreprise
   */
  async update(id: string, updateBusinessDto: UpdateBusinessDto, ownerId?: string): Promise<BusinessEntity> {
    const business = await this.prisma.business.findUnique({
      where: { id },
    });

    if (!business) {
      throw new NotFoundException('Entreprise introuvable');
    }

    // Vérifier la propriété si ownerId fourni
    if (ownerId && business.ownerId !== ownerId) {
      throw new BadRequestException('Vous n\'êtes pas autorisé à modifier cette entreprise');
    }

    // Générer un nouveau slug si le nom change
    let slug = business.slug;
    if (updateBusinessDto.name && updateBusinessDto.name !== business.name) {
      slug = await this.generateUniqueSlug(updateBusinessDto.name, id);
    }

    const updatedBusiness = await this.prisma.business.update({
      where: { id },
      data: {
        ...updateBusinessDto,
        slug,
      },
      include: {
        category: true,
      },
    });

    // Invalider le cache Redis
    await this.redisService.invalidateBusinessCache(id);
    this.logger.log(`Entreprise mise à jour: ${updatedBusiness.name} (${id})`);
    
    return updatedBusiness as BusinessEntity;
  }

  /**
   * Supprimer une entreprise
   */
  async remove(id: string, ownerId?: string): Promise<void> {
    const business = await this.prisma.business.findUnique({
      where: { id },
    });

    if (!business) {
      throw new NotFoundException('Entreprise introuvable');
    }

    // Vérifier la propriété si ownerId fourni
    if (ownerId && business.ownerId !== ownerId) {
      throw new BadRequestException('Vous n\'êtes pas autorisé à supprimer cette entreprise');
    }

    await this.prisma.business.delete({
      where: { id },
    });

    // Invalider le cache Redis
    await this.redisService.invalidateBusinessCache(id);
    this.logger.log(`Entreprise supprimée: ${business.name} (${id})`);
  }

  /**
   * Ingestion de données depuis n8n
   */
  async ingest(ingestDto: IngestBusinessDto): Promise<IngestionResponse> {
    const { source, rawData, ...extractedData } = ingestDto;
    const errors: string[] = [];
    let businessId: string | undefined;
    let success = false;

    // Créer le log d'ingestion
    const ingestionLog = await this.prisma.ingestionLog.create({
      data: {
        source,
        rawData,
        status: IngestionStatus.PROCESSING,
      },
    });

    try {
      // Validation des données extraites
      if (!extractedData.name) {
        errors.push('Nom de l\'entreprise manquant');
      }

      if (!extractedData.category) {
        errors.push('Catégorie manquante');
      }

      if (errors.length > 0) {
        throw new BadRequestException('Données invalides');
      }

      // Trouver ou créer la catégorie
      let category = await this.prisma.category.findFirst({
        where: {
          OR: [
            { name: { contains: extractedData.category, mode: 'insensitive' } },
            { slug: slugify(extractedData.category!, { lower: true }) },
          ],
        },
      });

      if (!category) {
        category = await this.prisma.category.create({
          data: {
            name: extractedData.category!,
            slug: slugify(extractedData.category!, { lower: true }),
          },
        });
      }

      // Vérifier si l'entreprise existe déjà
      const existingBusiness = await this.prisma.business.findFirst({
        where: {
          OR: [
            { name: extractedData.name },
            { email: extractedData.email },
            { phone: extractedData.phone },
          ].filter(Boolean),
        },
      });

      if (existingBusiness) {
        // Mettre à jour l'entreprise existante
        const { category: _, coordinates, ...businessData } = extractedData;
        const updatedBusiness = await this.prisma.business.update({
          where: { id: existingBusiness.id },
          data: {
            ...(extractedData.name && { name: extractedData.name }),
            ...(businessData.description && { description: businessData.description }),
            ...(businessData.email && { email: businessData.email }),
            ...(businessData.phone && { phone: businessData.phone }),
            ...(businessData.website && { website: businessData.website }),
            ...(businessData.address && { address: businessData.address }),
            ...(businessData.city && { city: businessData.city }),
            ...(businessData.region && { region: businessData.region }),
            ...(businessData.openingHours && { openingHours: businessData.openingHours }),
            categoryId: category.id,
            latitude: coordinates?.latitude,
            longitude: coordinates?.longitude,
          },
        });
        businessId = updatedBusiness.id;
        this.logger.log(`Entreprise mise à jour via ingestion: ${updatedBusiness.name}`);
      } else {
        // Créer une nouvelle entreprise (nécessite un propriétaire système)
        const systemUser = await this.getOrCreateSystemUser();
        const slug = await this.generateUniqueSlug(extractedData.name!);
        
        const { category: _, coordinates, ...businessData } = extractedData;
        const newBusiness = await this.prisma.business.create({
          data: {
            name: extractedData.name!,
            description: businessData.description,
            email: businessData.email,
            phone: businessData.phone,
            website: businessData.website,
            address: businessData.address,
            city: businessData.city,
            region: businessData.region,
            openingHours: businessData.openingHours,
            slug,
            categoryId: category.id,
            ownerId: systemUser.id,
            latitude: coordinates?.latitude,
            longitude: coordinates?.longitude,
            status: BusinessStatus.PENDING, // Nécessite validation
          },
        });
        businessId = newBusiness.id;
        this.logger.log(`Nouvelle entreprise créée via ingestion: ${newBusiness.name}`);
      }

      success = true;

      // Mettre à jour le log d'ingestion
      await this.prisma.ingestionLog.update({
        where: { id: ingestionLog.id },
        data: {
          status: IngestionStatus.SUCCESS,
          businessId,
          processed: extractedData,
        },
      });

    } catch (error) {
      this.logger.error(`Erreur lors de l'ingestion: ${error.message}`, error.stack);
      errors.push(error.message);

      // Mettre à jour le log d'ingestion avec l'erreur
      await this.prisma.ingestionLog.update({
        where: { id: ingestionLog.id },
        data: {
          status: IngestionStatus.FAILED,
          errors,
        },
      });
    }

    return {
      success,
      message: success ? 'Ingestion réussie' : 'Ingestion échouée',
      businessId,
      ingestionLogId: ingestionLog.id,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Générer un slug unique
   */
  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    const baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.business.findUnique({
        where: { slug },
      });

      if (!existing || (excludeId && existing.id === excludeId)) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Calculer la distance entre deux points GPS (formule de Haversine)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Obtenir ou créer l'utilisateur système pour l'ingestion
   */
  private async getOrCreateSystemUser() {
    let systemUser = await this.prisma.user.findUnique({
      where: { email: 'system@romapi.cm' },
    });

    if (!systemUser) {
      systemUser = await this.prisma.user.create({
        data: {
          email: 'system@romapi.cm',
          name: 'Système RomAPI',
          password: 'system', // Mot de passe temporaire
          role: 'ADMIN',
        },
      });
    }

    return systemUser;
  }
}