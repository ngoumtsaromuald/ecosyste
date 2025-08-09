import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryQueryDto {
  @ApiPropertyOptional({ description: 'Numéro de page', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Nombre d\'éléments par page', example: 50, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'Terme de recherche' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Champ de tri', enum: ['name', 'createdAt', 'businessCount'] })
  @IsOptional()
  @IsEnum(['name', 'createdAt', 'businessCount'])
  sortBy?: string = 'name';

  @ApiPropertyOptional({ description: 'Ordre de tri', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}