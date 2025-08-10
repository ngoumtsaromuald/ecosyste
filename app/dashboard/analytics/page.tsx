'use client';

import { useState } from 'react';
import { 
  Eye, 
  Phone, 
  Globe, 
  TrendingUp, 
  TrendingDown,
  Users, 
  MapPin,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

// Types
interface AnalyticsData {
  period: string;
  views: number;
  calls: number;
  websiteClicks: number;
  uniqueVisitors: number;
}

interface LocationData {
  city: string;
  views: number;
  percentage: number;
}

interface DeviceData {
  device: string;
  views: number;
  percentage: number;
}

// Données mockées
const analyticsData: AnalyticsData[] = [
  { period: '01/01', views: 45, calls: 8, websiteClicks: 12, uniqueVisitors: 38 },
  { period: '02/01', views: 52, calls: 12, websiteClicks: 15, uniqueVisitors: 44 },
  { period: '03/01', views: 38, calls: 6, websiteClicks: 9, uniqueVisitors: 32 },
  { period: '04/01', views: 61, calls: 15, websiteClicks: 18, uniqueVisitors: 51 },
  { period: '05/01', views: 48, calls: 9, websiteClicks: 14, uniqueVisitors: 41 },
  { period: '06/01', views: 55, calls: 11, websiteClicks: 16, uniqueVisitors: 47 },
  { period: '07/01', views: 42, calls: 7, websiteClicks: 11, uniqueVisitors: 36 },
];

const locationData: LocationData[] = [
  { city: 'Douala', views: 1247, percentage: 45.2 },
  { city: 'Yaoundé', views: 892, percentage: 32.3 },
  { city: 'Bafoussam', views: 324, percentage: 11.7 },
  { city: 'Garoua', views: 186, percentage: 6.7 },
  { city: 'Autres', views: 112, percentage: 4.1 },
];

const deviceData: DeviceData[] = [
  { device: 'Mobile', views: 1876, percentage: 67.8 },
  { device: 'Desktop', views: 654, percentage: 23.7 },
  { device: 'Tablette', views: 231, percentage: 8.5 },
];

const timeSlots = [
  { hour: '00h-02h', views: 12 },
  { hour: '02h-04h', views: 8 },
  { hour: '04h-06h', views: 15 },
  { hour: '06h-08h', views: 45 },
  { hour: '08h-10h', views: 89 },
  { hour: '10h-12h', views: 124 },
  { hour: '12h-14h', views: 156 },
  { hour: '14h-16h', views: 178 },
  { hour: '16h-18h', views: 145 },
  { hour: '18h-20h', views: 98 },
  { hour: '20h-22h', views: 67 },
  { hour: '22h-00h', views: 34 },
];

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('views');

  // Calculs des totaux et variations
  const currentPeriodData = analyticsData.slice(-7);
  const previousPeriodData = analyticsData.slice(-14, -7);
  
  const currentTotal = currentPeriodData.reduce((sum, item) => sum + Number(item[selectedMetric as keyof AnalyticsData]), 0);
  const previousTotal = previousPeriodData.reduce((sum, item) => sum + Number(item[selectedMetric as keyof AnalyticsData]), 0);
  const variation = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

  const maxValue = Math.max(...currentPeriodData.map(item => item[selectedMetric as keyof AnalyticsData] as number));

  const exportData = () => {
    // Simuler l'export des données
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Vues,Appels,Clics site web,Visiteurs uniques\n" +
      analyticsData.map(row => `${row.period},${row.views},${row.calls},${row.websiteClicks},${row.uniqueVisitors}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analytics-romapi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Analysez les performances détaillées de votre fiche entreprise
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">3 derniers mois</option>
            <option value="1y">12 derniers mois</option>
          </select>
          <button
            onClick={exportData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="-ml-1 mr-2 h-4 w-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: 'views', name: 'Vues totales', icon: Eye, value: currentTotal, color: 'blue' },
          { key: 'calls', name: 'Appels', icon: Phone, value: currentPeriodData.reduce((sum, item) => sum + item.calls, 0), color: 'green' },
          { key: 'websiteClicks', name: 'Clics site web', icon: Globe, value: currentPeriodData.reduce((sum, item) => sum + item.websiteClicks, 0), color: 'purple' },
          { key: 'uniqueVisitors', name: 'Visiteurs uniques', icon: Users, value: currentPeriodData.reduce((sum, item) => sum + item.uniqueVisitors, 0), color: 'orange' },
        ].map((metric) => {
          const Icon = metric.icon;
          const isSelected = selectedMetric === metric.key;
          
          return (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={`text-left p-6 rounded-lg shadow transition-all ${
                isSelected 
                  ? 'bg-blue-50 border-2 border-blue-200 ring-2 ring-blue-500 ring-opacity-20' 
                  : 'bg-white border border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    isSelected ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {metric.name}
                  </p>
                  <p className={`text-2xl font-semibold ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {metric.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  isSelected ? 'bg-blue-100' : 'bg-gray-50'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    isSelected ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <div className={`flex items-center text-sm ${
                  variation >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {variation >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(variation).toFixed(1)}%
                </div>
                <span className="ml-2 text-sm text-gray-500">vs période précédente</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Graphique principal */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Évolution des {selectedMetric === 'views' ? 'vues' : 
                           selectedMetric === 'calls' ? 'appels' :
                           selectedMetric === 'websiteClicks' ? 'clics site web' : 'visiteurs uniques'}
          </h2>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">7 derniers jours</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {currentPeriodData.map((item, index) => {
            const value = item[selectedMetric as keyof AnalyticsData] as number;
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            
            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-gray-600">{item.period}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                    <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Répartition géographique */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Répartition géographique</h2>
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {locationData.map((location, index) => (
              <div key={location.city} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-yellow-500' :
                    index === 3 ? 'bg-purple-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{location.city}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{location.views}</div>
                  <div className="text-xs text-gray-500">{location.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition par appareil */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Répartition par appareil</h2>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {deviceData.map((device, index) => (
              <div key={device.device} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{device.device}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{device.views}</div>
                  <div className="text-xs text-gray-500">{device.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activité par heure */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Activité par tranche horaire</h2>
          <Activity className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {timeSlots.map((slot) => {
            const maxViews = Math.max(...timeSlots.map(s => s.views));
            const percentage = (slot.views / maxViews) * 100;
            
            return (
              <div key={slot.hour} className="text-center">
                <div className="mb-2">
                  <div className="h-20 flex items-end justify-center">
                    <div
                      className="w-8 bg-blue-500 rounded-t transition-all duration-300"
                      style={{ height: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">{slot.hour}</div>
                <div className="text-sm font-medium text-gray-900">{slot.views}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights et recommandations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Insights & Recommandations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">🎯 Meilleure performance</h3>
            <p className="text-sm text-gray-600">
              Vos meilleures performances sont entre 14h et 18h. Considérez publier du contenu ou des promotions pendant ces heures.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">📱 Audience mobile</h3>
            <p className="text-sm text-gray-600">
              67.8% de vos visiteurs utilisent un mobile. Assurez-vous que votre site web est optimisé pour mobile.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">🌍 Expansion géographique</h3>
            <p className="text-sm text-gray-600">
              Douala et Yaoundé représentent 77.5% de vos vues. Explorez des opportunités dans d'autres villes.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">📞 Taux de conversion</h3>
            <p className="text-sm text-gray-600">
              Votre taux d'appel est de 4.2%. Ajoutez un bouton d'appel plus visible pour l'améliorer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}