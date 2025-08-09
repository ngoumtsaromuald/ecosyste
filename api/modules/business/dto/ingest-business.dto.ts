import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsArray, IsUrl, IsEmail } from 'class-validator';

export class IngestBusinessDto {
  @ApiProperty({ description: 'Source du scraping', example: 'yellowpages.cm' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'Données brutes scrapées (JSON)' })
  @IsObject()
  rawData: any;

  @ApiPropertyOptional({ description: 'Nom extrait', example: 'Restaurant Le Camerounais' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Description extraite' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Email extrait' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Téléphone extrait' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Site web extrait' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Adresse extraite' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Ville extraite' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Région extraite' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: 'Catégorie extraite' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Images extraites', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Horaires extraits (JSON)' })
  @IsOptional()
  @IsObject()
  openingHours?: any;

  @ApiPropertyOptional({ description: 'Coordonnées GPS extraites' })
  @IsOptional()
  @IsObject()
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
}
