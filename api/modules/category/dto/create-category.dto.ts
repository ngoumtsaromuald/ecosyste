import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Nom de la catégorie', example: 'Restaurants' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Slug de la catégorie', example: 'restaurants' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ description: 'Description de la catégorie' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Icône de la catégorie', example: 'utensils' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}