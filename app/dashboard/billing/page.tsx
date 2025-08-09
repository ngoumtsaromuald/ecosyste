'use client';

import { useState } from 'react';
import { 
  CreditCard, 
  Star, 
  Check, 
  X, 
  Download, 
  Calendar, 
  AlertCircle,
  Zap,
  TrendingUp,
  Eye,
  BarChart3,
  Shield,
  Headphones
} from 'lucide-react';

// Types
interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  current?: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  downloadUrl?: string;
}

// Données des plans
const plans: Plan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    currency: 'FCFA',
    period: 'mois',
    description: 'Parfait pour commencer',
    features: [
      'Fiche entreprise basique',
      'Jusqu\'à 3 images',
      'Informations de contact',
      'Horaires d\'ouverture',
      'Analytics de base (7 jours)'
    ],
    limitations: [
      'Pas de mise en avant',
      'Support par email uniquement',
      'Analytics limitées'
    ],
    current: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 15000,
    currency: 'FCFA',
    period: 'mois',
    description: 'Pour les entreprises qui veulent se démarquer',
    features: [
      'Tout du plan Gratuit',
      'Jusqu\'à 10 images haute qualité',
      'Mise en avant dans les résultats',
      'Badge "Premium" sur votre fiche',
      'Analytics avancées (90 jours)',
      'Support prioritaire',
      'Statistiques détaillées',
      'Export des données'
    ],
    popular: true,
    current: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 35000,
    currency: 'FCFA',
    period: 'mois',
    description: 'Pour les entreprises établies',
    features: [
      'Tout du plan Premium',
      'Images illimitées',
      'Mise en avant prioritaire',
      'Analytics complètes (1 an)',
      'API access (1000 requêtes/mois)',
      'Support téléphonique',
      'Rapports personnalisés',
      'Intégration CRM',
      'Manager de compte dédié'
    ]
  }
];

// Données des factures
const invoices: Invoice[] = [
  {
    id: 'INV-2024-001',
    date: '2024-01-15',
    amount: 15000,
    currency: 'FCFA',
    status: 'paid',
    description: 'Abonnement Premium - Janvier 2024',
    downloadUrl: '#'
  },
  {
    id: 'INV-2023-012',
    date: '2023-12-15',
    amount: 15000,
    currency: 'FCFA',
    status: 'paid',
    description: 'Abonnement Premium - Décembre 2023',
    downloadUrl: '#'
  },
  {
    id: 'INV-2023-011',
    date: '2023-11-15',
    amount: 15000,
    currency: 'FCFA',
    status: 'paid',
    description: 'Abonnement Premium - Novembre 2023',
    downloadUrl: '#'
  }
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const currentPlan = plans.find(plan => plan.current);
  const nextBillingDate = '15 février 2024';

  const handlePlanChange = async (planId: string) => {
    setIsLoading(true);
    setSelectedPlan(planId);
    
    // Simuler le changement de plan
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (planId !== 'free') {
      setShowPaymentModal(true);
    }
    
    setIsLoading(false);
  };

  const handlePayment = async () => {
    setIsLoading(true);
    
    // Simuler le processus de paiement
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setShowPaymentModal(false);
    setIsLoading(false);
    
    // Afficher un message de succès
    alert('Paiement effectué avec succès! Votre plan a été mis à jour.');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturation & Abonnements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez votre abonnement et consultez vos factures
          </p>
        </div>
      </div>

      {/* Plan actuel */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Plan actuel: {currentPlan?.name}</h2>
            <p className="text-blue-100 mt-1">
              {currentPlan?.price.toLocaleString()} {currentPlan?.currency}/{currentPlan?.period}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Prochaine facturation</p>
            <p className="text-lg font-semibold">{nextBillingDate}</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center">
            <Star className="w-5 h-5 mr-2 fill-current" />
            <span className="text-sm">Plan Premium actif</span>
          </div>
          <div className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            <span className="text-sm">Paiement sécurisé</span>
          </div>
        </div>
      </div>

      {/* Plans disponibles */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Changer de plan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg border-2 p-6 transition-all ${
                plan.current
                  ? 'border-blue-500 bg-blue-50'
                  : plan.popular
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-600 text-white">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Populaire
                  </span>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-3 right-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                    Plan actuel
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    {plan.currency}/{plan.period}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Fonctionnalités incluses:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.limitations && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Limitations:</h4>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start">
                          <X className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-500">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => handlePlanChange(plan.id)}
                  disabled={plan.current || isLoading}
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    plan.current
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.current ? 'Plan actuel' : 
                   plan.id === 'free' ? 'Rétrograder' : 'Choisir ce plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Méthodes de paiement */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Méthodes de paiement</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Carte bancaire</p>
                <p className="text-sm text-gray-500">**** **** **** 1234</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Par défaut
              </span>
              <button className="text-sm text-blue-600 hover:text-blue-500">
                Modifier
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded mr-3 flex items-center justify-center">
                <span className="text-white text-xs font-bold">OM</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Orange Money</p>
                <p className="text-sm text-gray-500">+237 6XX XXX XXX</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-500">
              Modifier
            </button>
          </div>
          
          <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
            + Ajouter une méthode de paiement
          </button>
        </div>
      </div>

      {/* Historique des factures */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Historique des factures</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                      <div className="text-sm text-gray-500">{invoice.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.amount.toLocaleString()} {invoice.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status === 'paid' ? 'Payée' :
                       invoice.status === 'pending' ? 'En attente' : 'Échec'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {invoice.downloadUrl && (
                      <button className="text-blue-600 hover:text-blue-500 flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        Télécharger
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer le changement de plan</h3>
            
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Nouveau plan:</span>
                  <span className="font-medium">
                    {plans.find(p => p.id === selectedPlan)?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Montant:</span>
                  <span className="font-medium">
                    {plans.find(p => p.id === selectedPlan)?.price.toLocaleString()} FCFA/mois
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Traitement...' : 'Confirmer le paiement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}