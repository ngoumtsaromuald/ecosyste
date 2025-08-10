import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, type JWTPayload as JoseJWTPayload } from 'jose';

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/api/protected',
];

// Routes qui nécessitent des rôles spécifiques
const adminRoutes = [
  '/admin',
  '/api/admin',
];

const businessRoutes = [
  '/business/manage',
  '/api/business',
];

// Routes publiques (pas d'authentification requise)
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/api/auth',
  '/api/public',
];

// Routes d'authentification (redirection si déjà connecté)
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

interface JWTPayload extends JoseJWTPayload {
  sub: string;
  email: string;
  role: 'USER' | 'BUSINESS' | 'ADMIN' | 'SUPER_ADMIN';
  iat: number;
  exp: number;
}

// Vérifier si une route correspond à un pattern
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

// Vérifier et décoder le JWT
async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key'
    );
    
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Vérifier les permissions de rôle
function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  const roleHierarchy = {
    'USER': 1,
    'BUSINESS': 2,
    'ADMIN': 3,
    'SUPER_ADMIN': 4,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = Math.min(
    ...requiredRoles.map(role => roleHierarchy[role as keyof typeof roleHierarchy] || 999)
  );

  return userLevel >= requiredLevel;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ignorer les fichiers statiques et les API routes Next.js internes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Récupérer le token d'authentification
  const accessToken = request.cookies.get('accessToken')?.value;
  let user: JWTPayload | null = null;

  // Vérifier le token si présent
  if (accessToken) {
    user = await verifyJWT(accessToken);
  }

  // Routes publiques - pas de vérification nécessaire
  if (matchesRoute(pathname, publicRoutes)) {
    return NextResponse.next();
  }

  // Routes d'authentification - rediriger si déjà connecté
  if (matchesRoute(pathname, authRoutes)) {
    if (user) {
      const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // Routes protégées - vérifier l'authentification
  if (matchesRoute(pathname, protectedRoutes)) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Routes admin - vérifier le rôle admin
  if (matchesRoute(pathname, adminRoutes)) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (!hasRequiredRole(user.role, ['ADMIN', 'SUPER_ADMIN'])) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Routes business - vérifier le rôle business ou admin
  if (matchesRoute(pathname, businessRoutes)) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (!hasRequiredRole(user.role, ['BUSINESS', 'ADMIN', 'SUPER_ADMIN'])) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Ajouter les informations utilisateur aux headers pour les composants
  const response = NextResponse.next();
  
  if (user) {
    response.headers.set('x-user-id', user.sub);
    response.headers.set('x-user-email', user.email);
    response.headers.set('x-user-role', user.role);
  }

  return response;
}

// Configuration du middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};