'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bell, User, LogOut, Settings, Menu, X } from 'lucide-react';

export function DashboardHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Mock user data - à remplacer par les vraies données utilisateur
  const user = {
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    avatar: null,
    business: 'Restaurant Le Cameroun',
  };

  const notifications = [
    {
      id: 1,
      title: 'Nouvelle vue sur votre fiche',
      message: 'Votre entreprise a été consultée 15 fois aujourd\'hui',
      time: '2h',
      unread: true,
    },
    {
      id: 2,
      title: 'Mise à jour recommandée',
      message: 'Ajoutez des photos pour améliorer votre visibilité',
      time: '1j',
      unread: true,
    },
    {
      id: 3,
      title: 'Paiement confirmé',
      message: 'Votre abonnement Premium a été renouvelé',
      time: '3j',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et navigation mobile */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:block">RomAPI Dashboard</span>
            </Link>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Menu notifications */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="font-medium text-gray-900">Notifications</h3>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                          notification.unread ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="px-4 py-2 border-t border-gray-200">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menu utilisateur */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.business}</p>
                </div>
              </button>

              {/* Menu déroulant utilisateur */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4" />
                      Mon profil
                    </Link>
                    
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4" />
                      Paramètres
                    </Link>
                    
                    <div className="border-t border-gray-200 my-2"></div>
                    
                    <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            <Link
              href="/dashboard"
              className="block px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-md"
            >
              Tableau de bord
            </Link>
            <Link
              href="/dashboard/business"
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Ma fiche entreprise
            </Link>
            <Link
              href="/dashboard/analytics"
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Analytics
            </Link>
            <Link
              href="/dashboard/billing"
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Facturation
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}