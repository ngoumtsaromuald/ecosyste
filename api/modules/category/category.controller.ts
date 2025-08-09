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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryEntity, CategoryListResponse } from './entities/category.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Créer une nouvelle catégorie (admin seulement)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle catégorie' })
  @ApiResponse({ status: 201, description: 'Catégorie créée avec succès', type: CategoryEntity })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req: any
  ): Promise<CategoryEntity> {
    return this.categoryService.create(createCategoryDto);
  }

  /**
   * Récupérer toutes les catégories
   */
  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Lister les catégories',
    description: 'Récupère la liste des catégories avec possibilité de pagination.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des catégories récupérée avec succès',
    type: CategoryListResponse
  })
  async findAll(@Query() query: CategoryQueryDto): Promise<CategoryListResponse> {
    return this.categoryService.findAll(query);
  }

  /**
   * Récupérer une catégorie par ID
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une catégorie par ID' })
  @ApiResponse({ status: 200, description: 'Catégorie trouvée', type: CategoryEntity })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  async findOne(@Param('id') id: string): Promise<CategoryEntity> {
    return this.categoryService.findOne(id);
  }

  /**
   * Mettre à jour une catégorie (admin seulement)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour une catégorie' })
  @ApiResponse({ status: 200, description: 'Catégorie mise à jour avec succès', type: CategoryEntity })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ): Promise<CategoryEntity> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  /**
   * Supprimer une catégorie (admin seulement)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une catégorie' })
  @ApiResponse({ status: 200, description: 'Catégorie supprimée avec succès' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoryService.remove(id);
  }
}