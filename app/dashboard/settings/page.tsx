'use client';

import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  Shield, 
  Key, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Check,
  X,
  Globe,
  Smartphone
} from 'lucide-react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  avatar?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'Romuald',
    lastName: 'Kamdem',
    email: 'romuald@romapi.cm',
    phone: '+237 6XX XXX XXX',
    address: '123 Rue de la Paix',
    city: 'Douala'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    weeklyReports: true,
    monthlyReports: true
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Sécurité', icon: Shield },
    { id: 'api', name: 'API', icon: Key },
  ];

  const handleSave = async (section: string) => {
    setIsLoading(true);
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    
    if (passwords.new.length < 8) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères.' });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès!' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la modification du mot de passe.' });
    } finally {
      setIsLoading(false);
    }
  };

  const generateApiKey = () => {
    const key = 'romapi_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    navigator.clipboard.writeText(key);
    setMessage({ type: 'success', text: 'Nouvelle clé API générée et copiée dans le presse-papiers!' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gérez vos préférences et paramètres de compte
        </p>
      </div>

      {/* Message de notification */}
      {message && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <X className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:space-x-8">
        {/* Navigation des onglets */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="flex-1 mt-6 lg:mt-0">
          {/* Onglet Profil */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Informations personnelles</h2>
                </div>
                
                <div className="px-6 py-6 space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-6">
                    <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-600" />
                    </div>
                    <div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                        Changer la photo
                      </button>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG jusqu'à 2MB</p>
                    </div>
                  </div>

                  {/* Nom et prénom */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Email et téléphone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Adresse */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse
                      </label>
                      <input
                        type="text"
                        value={profile.address}
                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <select
                        value={profile.city}
                        onChange={(e) => setProfile({...profile, city: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Douala">Douala</option>
                        <option value="Yaoundé">Yaoundé</option>
                        <option value="Bafoussam">Bafoussam</option>
                        <option value="Garoua">Garoua</option>
                        <option value="Maroua">Maroua</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSave('profile')}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <Save className="-ml-1 mr-2 h-4 w-4" />
                      {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Changement de mot de passe */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Changer le mot de passe</h2>
                </div>
                
                <div className="px-6 py-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwords.current}
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le mot de passe
                      </label>
                      <input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handlePasswordChange}
                      disabled={isLoading || !passwords.current || !passwords.new || !passwords.confirm}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <Key className="-ml-1 mr-2 h-4 w-4" />
                      {isLoading ? 'Modification...' : 'Changer le mot de passe'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Préférences de notification</h2>
                <p className="text-sm text-gray-500">Choisissez comment vous souhaitez être informé</p>
              </div>
              
              <div className="px-6 py-6 space-y-6">
                {[
                  { key: 'emailNotifications', label: 'Notifications par email', description: 'Recevoir des notifications importantes par email', icon: Mail },
                  { key: 'smsNotifications', label: 'Notifications SMS', description: 'Recevoir des alertes urgentes par SMS', icon: Smartphone },
                  { key: 'pushNotifications', label: 'Notifications push', description: 'Recevoir des notifications dans le navigateur', icon: Bell },
                  { key: 'marketingEmails', label: 'Emails marketing', description: 'Recevoir des offres et actualités RomAPI', icon: Globe },
                  { key: 'weeklyReports', label: 'Rapports hebdomadaires', description: 'Résumé de vos performances chaque semaine', icon: BarChart3 },
                  { key: 'monthlyReports', label: 'Rapports mensuels', description: 'Analyse détaillée de vos performances mensuelles', icon: TrendingUp },
                ].map((setting) => {
                  const Icon = setting.icon;
                  return (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div className="flex items-start">
                        <Icon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{setting.label}</h3>
                          <p className="text-sm text-gray-500">{setting.description}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[setting.key as keyof NotificationSettings]}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            [setting.key]: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  );
                })}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => handleSave('notifications')}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <Save className="-ml-1 mr-2 h-4 w-4" />
                    {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Sécurité */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Paramètres de sécurité</h2>
                </div>
                
                <div className="px-6 py-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Authentification à deux facteurs</h3>
                      <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire</p>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        security.twoFactorEnabled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {security.twoFactorEnabled ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Alertes de connexion</h3>
                      <p className="text-sm text-gray-500">Être notifié des nouvelles connexions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={security.loginAlerts}
                        onChange={(e) => setSecurity({...security, loginAlerts: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Délai d'expiration de session (minutes)
                    </label>
                    <select
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({...security, sessionTimeout: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 heure</option>
                      <option value={120}>2 heures</option>
                      <option value={480}>8 heures</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSave('security')}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <Save className="-ml-1 mr-2 h-4 w-4" />
                      {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Zone de danger */}
              <div className="bg-white shadow rounded-lg border-l-4 border-red-400">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">Zone de danger</h2>
                  </div>
                </div>
                
                <div className="px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Supprimer le compte</h3>
                      <p className="text-sm text-gray-500">Supprimer définitivement votre compte et toutes vos données</p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                      <Trash2 className="w-4 h-4 mr-2 inline" />
                      Supprimer le compte
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet API */}
          {activeTab === 'api' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Clés API</h2>
                <p className="text-sm text-gray-500">Gérez vos clés d'accès à l'API RomAPI</p>
              </div>
              
              <div className="px-6 py-6 space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Sécurité importante</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Gardez vos clés API secrètes. Ne les partagez jamais publiquement.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Clé API principale</h3>
                      <p className="text-sm text-gray-500 font-mono">romapi_xxxxxxxxxxxxxxxxxx</p>
                      <p className="text-xs text-gray-400 mt-1">Créée le 15 janvier 2024</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-500">
                        Copier
                      </button>
                      <button className="px-3 py-1 text-sm text-red-600 hover:text-red-500">
                        Révoquer
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Générer une nouvelle clé</h3>
                    <p className="text-sm text-gray-500">Créer une nouvelle clé API pour vos intégrations</p>
                  </div>
                  <button
                    onClick={generateApiKey}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    <Key className="w-4 h-4 mr-2 inline" />
                    Générer une clé
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Utilisation de l'API</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Requêtes ce mois</p>
                      <p className="text-lg font-semibold text-gray-900">1,247</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Limite mensuelle</p>
                      <p className="text-lg font-semibold text-gray-900">10,000</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Taux d'utilisation</p>
                      <p className="text-lg font-semibold text-gray-900">12.5%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}