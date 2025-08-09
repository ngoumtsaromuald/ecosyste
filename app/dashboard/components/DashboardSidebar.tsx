'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  BarChart3, 
  CreditCard, 
  Settings, 
  HelpCircle,
  Star,
  Eye,
  Users,
  TrendingUp
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

const navigation: NavItem[] = [
  {
    name: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble de vos performances',
  },
  {
    name: 'Ma fiche entreprise',
    href: '/dashboard/business',
    icon: Building2,
    description: 'Gérer les informations de votre entreprise',
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Statistiques détaillées et insights',
  },
  {
    name: 'Facturation',
    href: '/dashboard/billing',
    icon: CreditCard,
    description: 'Abonnements et paiements',
  },
  {
    name: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Configuration du compte',
  },
];

const quickStats = [
  {
    name: 'Vues ce mois',
    value: '1,234',
    icon: Eye,
    change: '+12%',
    positive: true,
  },
  {
    name: 'Clics téléphone',
    value: '89',
    icon: Users,
    change: '+8%',
    positive: true,
  },
  {
    name: 'Visites site web',
    value: '156',
    icon: TrendingUp,
    change: '+15%',
    positive: true,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0 lg:pt-16 bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Navigation principale */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Navigation
            </h2>
            
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${
                      active
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${
                        active
                          ? 'text-blue-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }
                    `}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Statistiques rapides */}
        <div className="px-4 py-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Aperçu rapide
          </h3>
          
          <div className="space-y-3">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              
              return (
                <div key={stat.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.name}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      stat.positive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan actuel */}
        <div className="px-4 py-6 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Plan Premium</h3>
              <Star className="w-4 h-4 fill-current" />
            </div>
            <p className="text-xs text-blue-100 mb-3">
              Profitez de toutes les fonctionnalités avancées
            </p>
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center text-xs font-medium text-white hover:text-blue-100 underline"
            >
              Gérer l'abonnement
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="px-4 py-4 border-t border-gray-200">
          <Link
            href="/dashboard/help"
            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
          >
            <HelpCircle className="mr-3 h-5 w-5 text-gray-400" />
            Aide & Support
          </Link>
        </div>
      </div>
    </aside>
  );
}