import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryEntity {
  @ApiProperty({ description: 'ID de la catégorie' })
  id: string;

  @ApiProperty({ description: 'Nom de la catégorie' })
  name: string;

  @ApiProperty({ description: 'Slug de la catégorie' })
  slug: string;

  @ApiPropertyOptional({ description: 'Description de la catégorie' })
  description?: string;

  @ApiPropertyOptional({ description: 'Icône de la catégorie' })
  icon?: string;

  @ApiPropertyOptional({ description: 'Nombre d\'entreprises dans cette catégorie' })
  businessCount?: number;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  updatedAt: Date;
}

export class CategoryListResponse {
  @ApiProperty({ description: 'Liste des catégories', type: [CategoryEntity] })
  data: CategoryEntity[];

  @ApiProperty({ description: 'Métadonnées de pagination' })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}