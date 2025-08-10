import { NextRequest, NextResponse } from 'next/server';
import { categoryQueries, supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les catégories depuis Supabase
    const { data: categories, error } = await categoryQueries.getCategories();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Compter le nombre d'entreprises par catégorie
    const categoriesWithCount = await Promise.all(
      (categories || []).map(async (category) => {
        const { count } = await supabase
          .from('businesses')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('status', 'APPROVED');

        return {
          ...category,
          businessCount: count || 0,
          icon: getCategoryIcon(category.slug)
        };
      })
    );

    const response = {
      data: categoriesWithCount,
      total: categoriesWithCount.length,
      page: 1,
      limit: 100,
      totalPages: 1
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour associer des icônes aux catégories
function getCategoryIcon(slug: string): string {
  const iconMap: Record<string, string> = {
    'restaurant': 'utensils',
    'hospitality': 'bed',
    'commerce': 'shopping-bag',
    'services': 'briefcase',
    'industry': 'factory',
    'transportation': 'truck',
    'healthcare': 'heart',
    'education': 'graduation-cap',
    'banking': 'credit-card',
    'insurance': 'shield'
  };
  
  return iconMap[slug] || 'building';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('categories')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}