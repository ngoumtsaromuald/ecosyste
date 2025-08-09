import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessStatus, BusinessPlan } from '@prisma/client';

export class BusinessQueryDto {
  @ApiPropertyOptional({ description: 'Numéro de page', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Nombre d\'éléments par page', example: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Recherche textuelle dans nom et description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrer par catégorie (ID ou slug)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filtrer par ville' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filtrer par région' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: 'Filtrer par statut', enum: BusinessStatus })
  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;

  @ApiPropertyOptional({ description: 'Filtrer par plan', enum: BusinessPlan })
  @IsOptional()
  @IsEnum(BusinessPlan)
  plan?: BusinessPlan;

  @ApiPropertyOptional({ description: 'Afficher seulement les entreprises mises en avant', default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ description: 'Latitude pour recherche géographique' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude pour recherche géographique' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Rayon de recherche en km', example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  radius?: number;

  @ApiPropertyOptional({ 
    description: 'Tri des résultats', 
    enum: ['name', 'createdAt', 'viewCount', 'featured', 'distance'],
    example: 'name'
  })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'createdAt' | 'viewCount' | 'featured' | 'distance' = 'createdAt';

  @ApiPropertyOptional({ 
    description: 'Ordre de tri', 
    enum: ['asc', 'desc'],
    example: 'desc'
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
