import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsUrl, IsArray, IsNumber, IsEnum, IsBoolean, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessStatus, BusinessPlan } from '@prisma/client';

export class CreateBusinessDto {
  @ApiProperty({ description: 'Nom de l\'entreprise', example: 'Restaurant Le Camerounais' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description de l\'entreprise' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Email de contact', example: 'contact@lecamerounais.cm' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Téléphone (format camerounais)', example: '+237670123456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Site web', example: 'https://lecamerounais.cm' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Adresse complète' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Ville', example: 'Douala' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Région', example: 'Littoral' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: 'Département', example: 'Wouri' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Code postal' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Latitude', example: 4.0511 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude', example: 9.7679 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: 'ID de la catégorie' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ description: 'URL du logo' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: 'URLs des images', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Horaires d\'ouverture (JSON)', example: { monday: '08:00-18:00', tuesday: '08:00-18:00' } })
  @IsOptional()
  @IsObject()
  openingHours?: any;

  @ApiPropertyOptional({ description: 'Titre SEO' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'Description SEO' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Statut de l\'entreprise', enum: BusinessStatus, default: BusinessStatus.PENDING })
  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;

  @ApiPropertyOptional({ description: 'Plan de l\'entreprise', enum: BusinessPlan, default: BusinessPlan.FREE })
  @IsOptional()
  @IsEnum(BusinessPlan)
  plan?: BusinessPlan;

  @ApiPropertyOptional({ description: 'Entreprise mise en avant', default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
