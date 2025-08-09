import { Suspense } from 'react';
import { 
  Eye, 
  Phone, 
  Globe, 
  TrendingUp, 
  Users, 
  Star,
  Calendar,
  MapPin,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Settings
} from 'lucide-react';
import Link from 'next/link';

// Composants de chargement
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="mt-4">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}

// Données mockées (à remplacer par des appels API)
const stats = [
  {
    name: 'Vues totales',
    value: '2,847',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: Eye,
    description: 'Ce mois-ci',
  },
  {
    name: 'Appels téléphoniques',
    value: '127',
    change: '+8.2%',
    changeType: 'positive' as const,
    icon: Phone,
    description: 'Ce mois-ci',
  },
  {
    name: 'Visites site web',
    value: '89',
    change: '+15.3%',
    changeType: 'positive' as const,
    icon: Globe,
    description: 'Ce mois-ci',
  },
  {
    name: 'Taux de conversion',
    value: '4.2%',
    change: '-2.1%',
    changeType: 'negative' as const,
    icon: TrendingUp,
    description: 'Ce mois-ci',
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'view',
    description: 'Nouvelle vue de votre fiche',
    location: 'Douala, Cameroun',
    time: 'Il y a 2 minutes',
    icon: Eye,
  },
  {
    id: 2,
    type: 'call',
    description: 'Appel téléphonique reçu',
    location: 'Yaoundé, Cameroun',
    time: 'Il y a 15 minutes',
    icon: Phone,
  },
  {
    id: 3,
    type: 'website',
    description: 'Visite de votre site web',
    location: 'Bafoussam, Cameroun',
    time: 'Il y a 1 heure',
    icon: Globe,
  },
  {
    id: 4,
    type: 'review',
    description: 'Nouvel avis client',
    location: 'Garoua, Cameroun',
    time: 'Il y a 3 heures',
    icon: Star,
  },
];

const topPerformingDays = [
  { day: 'Lundi', views: 45, calls: 8 },
  { day: 'Mardi', views: 52, calls: 12 },
  { day: 'Mercredi', views: 38, calls: 6 },
  { day: 'Jeudi', views: 61, calls: 15 },
  { day: 'Vendredi', views: 48, calls: 9 },
  { day: 'Samedi', views: 33, calls: 4 },
  { day: 'Dimanche', views: 28, calls: 3 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-gray-500">
            Suivez les performances de votre entreprise sur RomAPI
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            href="/dashboard/business"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Modifier ma fiche
          </Link>
          <Link
            href="/dashboard/analytics"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <BarChart3 className="-ml-1 mr-2 h-4 w-4" />
            Analytics détaillées
          </Link>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<StatCardSkeleton />}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <div className={`flex items-center text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {stat.change}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">{stat.description}</span>
                </div>
              </div>
            );
          })}
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique des performances */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Performances hebdomadaires</h2>
            <Link
              href="/dashboard/analytics"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Voir tout
            </Link>
          </div>
          
          <div className="space-y-4">
            {topPerformingDays.map((day, index) => {
              const maxViews = Math.max(...topPerformingDays.map(d => d.views));
              const viewsPercentage = (day.views / maxViews) * 100;
              
              return (
                <div key={day.day} className="flex items-center space-x-4">
                  <div className="w-16 text-sm text-gray-600">{day.day}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-900">{day.views} vues</span>
                      <span className="text-sm text-gray-500">{day.calls} appels</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${viewsPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Activité récente</h2>
            <Link
              href="/dashboard/analytics"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Voir tout
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="mr-2">{activity.location}</span>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Actions rapides</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/business"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Building2 className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Modifier ma fiche</p>
              <p className="text-xs text-gray-500">Mettre à jour les informations</p>
            </div>
          </Link>
          
          <Link
            href="/dashboard/billing"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Star className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Mettre en avant</p>
              <p className="text-xs text-gray-500">Booster votre visibilité</p>
            </div>
          </Link>
          
          <Link
            href="/dashboard/analytics"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Analytics</p>
              <p className="text-xs text-gray-500">Voir les statistiques</p>
            </div>
          </Link>
          
          <Link
            href="/dashboard/settings"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-8 w-8 text-gray-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Paramètres</p>
              <p className="text-xs text-gray-500">Configurer le compte</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}