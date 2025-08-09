import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessStatus, BusinessPlan } from '@prisma/client';

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

  @ApiPropertyOptional({ description: 'Couleur de la catégorie' })
  color?: string;
}

export class BusinessEntity {
  @ApiProperty({ description: 'ID unique de l\'entreprise' })
  id: string;

  @ApiProperty({ description: 'Nom de l\'entreprise' })
  name: string;

  @ApiProperty({ description: 'Slug unique de l\'entreprise' })
  slug: string;

  @ApiPropertyOptional({ description: 'Description de l\'entreprise' })
  description?: string;

  @ApiPropertyOptional({ description: 'Email de contact' })
  email?: string;

  @ApiPropertyOptional({ description: 'Téléphone de contact' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Site web' })
  website?: string;

  @ApiPropertyOptional({ description: 'Adresse complète' })
  address?: string;

  @ApiPropertyOptional({ description: 'Ville' })
  city?: string;

  @ApiPropertyOptional({ description: 'Région' })
  region?: string;

  @ApiPropertyOptional({ description: 'Département' })
  department?: string;

  @ApiPropertyOptional({ description: 'Code postal' })
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Latitude' })
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude' })
  longitude?: number;

  @ApiPropertyOptional({ description: 'URL du logo' })
  logo?: string;

  @ApiPropertyOptional({ description: 'URLs des images', type: [String] })
  images?: string[];

  @ApiProperty({ description: 'Catégorie de l\'entreprise' })
  category: CategoryEntity;

  @ApiProperty({ description: 'Statut de l\'entreprise', enum: BusinessStatus })
  status: BusinessStatus;

  @ApiProperty({ description: 'Plan de l\'entreprise', enum: BusinessPlan })
  plan: BusinessPlan;

  @ApiPropertyOptional({ description: 'Horaires d\'ouverture (JSON)' })
  openingHours?: any;

  @ApiPropertyOptional({ description: 'Titre SEO' })
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'Description SEO' })
  metaDescription?: string;

  @ApiProperty({ description: 'Entreprise mise en avant' })
  featured: boolean;

  @ApiPropertyOptional({ description: 'Date de fin de mise en avant' })
  featuredUntil?: Date;

  @ApiProperty({ description: 'Nombre de vues' })
  viewCount: number;

  @ApiProperty({ description: 'Nombre de clics' })
  clickCount: number;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Distance en km (si recherche géographique)' })
  distance?: number;
}

export class BusinessListResponse {
  @ApiProperty({ description: 'Liste des entreprises', type: [BusinessEntity] })
  data: BusinessEntity[];

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

export class IngestionResponse {
  @ApiProperty({ description: 'Succès de l\'opération' })
  success: boolean;

  @ApiProperty({ description: 'Message de résultat' })
  message: string;

  @ApiPropertyOptional({ description: 'ID de l\'entreprise créée/mise à jour' })
  businessId?: string;

  @ApiPropertyOptional({ description: 'ID du log d\'ingestion' })
  ingestionLogId?: string;

  @ApiPropertyOptional({ description: 'Erreurs rencontrées', type: [String] })
  errors?: string[];
}
