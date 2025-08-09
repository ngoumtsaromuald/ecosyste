import { NextRequest, NextResponse } from 'next/server';
import { businessQueries, supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const categoryId = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    // Récupérer les entreprises depuis Supabase
    const { data: businesses, error, count } = await businessQueries.getBusinesses(
      page,
      limit,
      categoryId,
      search
    );
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch businesses' },
        { status: 500 }
      );
    }

    // Transformer les données pour correspondre au format attendu par le frontend
    const transformedBusinesses = (businesses || []).map(business => ({
      ...business,
      slug: business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      images: business.website ? 
        [`https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center`] : 
        [],
      status: business.status === 'APPROVED' ? 'ACTIVE' : business.status,
      viewCount: Math.floor(Math.random() * 200) + 50, // Données simulées pour les vues
      clickCount: Math.floor(Math.random() * 50) + 10   // Données simulées pour les clics
    }));

    const totalPages = Math.ceil((count || 0) / limit);

    const response = {
      data: transformedBusinesses,
      total: count || 0,
      page,
      limit,
      totalPages
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données requises
    if (!body.name) {
      return NextResponse.json(
        { error: 'Le nom de l\'entreprise est requis' },
        { status: 400 }
      );
    }

    // Créer l'entreprise dans la base de données
    const result = await businessQueries.createBusiness(body);
    
    if (result.error) {
      console.error('Erreur Supabase:', result.error);
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'entreprise' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Entreprise créée avec succès',
        business: result.data
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création de l\'entreprise:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}