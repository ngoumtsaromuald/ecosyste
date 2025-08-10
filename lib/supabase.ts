import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client Supabase avec service role pour les opérations d'écriture (si disponible)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = supabaseServiceRoleKey && supabaseServiceRoleKey !== 'your-service-role-key-here' 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase

// Types pour TypeScript
export interface Business {
  id: string
  name: string
  description?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  city: string
  region: string
  country: string
  latitude?: number
  longitude?: number
  category_id?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  verified: boolean
  featured: boolean
  source?: string
  scraped_at?: string
  created_at: string
  updated_at: string
  category?: Category
}

export interface Category {
  id: string
  name: string
  description?: string
  slug: string
  created_at: string
  updated_at: string
}

// Fonctions utilitaires pour les requêtes
export const businessQueries = {
  // Récupérer toutes les entreprises avec pagination
  async getBusinesses(page = 1, limit = 12, categoryId?: string, search?: string) {
    let query = supabase
      .from('businesses')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('status', 'APPROVED')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)

    return { data, error, count }
  },

  // Récupérer une entreprise par slug/id
  async getBusinessById(id: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', id)
      .eq('status', 'APPROVED')
      .single()

    return { data, error }
  },

  // Insérer une nouvelle entreprise (pour le scraping)
  async insertBusiness(business: Omit<Business, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('businesses')
      .insert(business)
      .select()
      .single()

    return { data, error }
  },

  // Créer une nouvelle entreprise (pour l'API publique)
  async createBusiness(business: {
    name: string
    description: string
    category_id: string
    phone: string
    email?: string | null
    website?: string | null
    address: string
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  }) {
    const businessData = {
       ...business,
       city: 'Douala', // Valeur par défaut
       region: 'Littoral', // Valeur par défaut
       country: 'CM', // Code pays Cameroun (2 caractères)
       verified: false,
       featured: false,
       status: business.status || 'PENDING'
     }

    const { data, error } = await supabase
      .from('businesses')
      .insert(businessData)
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    return { data, error }
  }
}

export const createBusiness = async (businessData: any) => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        name: businessData.name,
        description: businessData.description,
        category_id: businessData.category_id,
        phone: businessData.phone,
        email: businessData.email,
        website: businessData.website,
        address: businessData.address,
        city: businessData.city || 'Douala',
        region: businessData.region || 'Littoral',
        country: businessData.country || 'CM'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating business:', error);
    return { data: null, error };
  }
};

export const categoryQueries = {
  // Récupérer toutes les catégories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    return { data, error }
  },

  // Récupérer une catégorie par slug
  async getCategoryBySlug(slug: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    return { data, error }
  }
}