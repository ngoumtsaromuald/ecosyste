import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryEntity, CategoryListResponse } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer une nouvelle catégorie
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    const { name, slug, description, icon } = createCategoryDto;

    // Vérifier si le slug existe déjà
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      throw new ConflictException('Une catégorie avec ce slug existe déjà');
    }

    const category = await this.prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
      },
    });

    return {
      ...category,
      description: category.description ?? undefined,
      icon: category.icon ?? undefined
    };
  }

  /**
   * Récupérer toutes les catégories avec pagination
   */
  async findAll(query: CategoryQueryDto): Promise<CategoryListResponse> {
    const { page = 1, limit = 50, search, sortBy = 'name', sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;

    // Construire les conditions de recherche
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Construire l'ordre de tri
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: { businesses: true }
          }
        }
      }),
      this.prisma.category.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: categories.map(cat => ({
        ...cat,
        description: cat.description ?? undefined,
        icon: cat.icon ?? undefined,
        businessCount: cat._count.businesses
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Récupérer une catégorie par ID
   */
  async findOne(id: string): Promise<CategoryEntity> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { businesses: true }
        }
      }
    });

    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    return {
      ...category,
      description: category.description ?? undefined,
      icon: category.icon ?? undefined,
      businessCount: category._count.businesses
    };
  }

  /**
   * Récupérer une catégorie par slug
   */
  async findBySlug(slug: string): Promise<CategoryEntity> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { businesses: true }
        }
      }
    });

    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    return {
      ...category,
      description: category.description ?? undefined,
      icon: category.icon ?? undefined,
      businessCount: category._count.businesses
    };
  }

  /**
   * Mettre à jour une catégorie
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryEntity> {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    // Vérifier si le nouveau slug existe déjà (si fourni)
    if (updateCategoryDto.slug && updateCategoryDto.slug !== existingCategory.slug) {
      const slugExists = await this.prisma.category.findUnique({
        where: { slug: updateCategoryDto.slug }
      });

      if (slugExists) {
        throw new ConflictException('Une catégorie avec ce slug existe déjà');
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        _count: {
          select: { businesses: true }
        }
      }
    });

    return {
      ...category,
      description: category.description ?? undefined,
      icon: category.icon ?? undefined,
      businessCount: category._count.businesses
    };
  }

  /**
   * Supprimer une catégorie
   */
  async remove(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { businesses: true }
        }
      }
    });

    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    if (category._count.businesses > 0) {
      throw new ConflictException('Impossible de supprimer une catégorie qui contient des entreprises');
    }

    await this.prisma.category.delete({
      where: { id }
    });
  }
}