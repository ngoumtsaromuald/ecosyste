'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { useState } from 'react';

export function Pricing() {
  const [activeTab, setActiveTab] = useState<'business' | 'api'>('business');

  const businessPlans = [
    {
      name: "Gratuit",
      price: "0",
      period: "/ mois",
      description: "Parfait pour commencer",
      features: [
        "Fiche entreprise basique",
        "Jusqu'à 5 photos",
        "Informations de contact",
        "Support par email",
        "Statistiques de base"
      ],
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-white",
      textColor: "text-gray-900",
      buttonVariant: "outline" as const,
      popular: false,
      icon: Check
    },
    {
      name: "Premium",
      price: "15,000",
      period: "/ mois",
      description: "Pour les entreprises en croissance",
      features: [
        "Fiche entreprise complète",
        "Photos et vidéos illimitées",
        "Analytics avancés",
        "Support prioritaire",
        "Intégration réseaux sociaux",
        "Gestion des avis clients",
        "Promotion ciblée"
      ],
      color: "from-indigo-500 to-purple-600",
      bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50",
      textColor: "text-gray-900",
      buttonVariant: "default" as const,
      popular: true,
      icon: Star
    },
    {
      name: "Mise en avant",
      price: "35,000",
      period: "/ mois",
      description: "Maximum de visibilité",
      features: [
        "Tout du plan Premium",
        "Position prioritaire",
        "Badge 'Recommandé'",
        "Campagnes publicitaires",
        "Support dédié 24/7",
        "Rapports personnalisés",
        "API d'intégration",
        "Formation personnalisée"
      ],
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
      textColor: "text-gray-900",
      buttonVariant: "default" as const,
      popular: false,
      icon: Crown
    }
  ];

  const apiPlans = [
    {
      name: "Gratuit",
      price: "0",
      period: "/ mois",
      description: "Pour tester nos APIs",
      features: [
        "1,000 requêtes/mois",
        "Accès API de base",
        "Documentation complète",
        "Support communautaire",
        "Limite de 10 req/min"
      ],
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-white",
      textColor: "text-gray-900",
      buttonVariant: "outline" as const,
      popular: false,
      icon: Check
    },
    {
      name: "Pro",
      price: "25,000",
      period: "/ mois",
      description: "Pour les développeurs actifs",
      features: [
        "50,000 requêtes/mois",
        "Toutes les APIs",
        "Webhooks en temps réel",
        "Support technique",
        "Limite de 100 req/min",
        "Analytics détaillés",
        "SDK complets"
      ],
      color: "from-indigo-500 to-purple-600",
      bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50",
      textColor: "text-gray-900",
      buttonVariant: "default" as const,
      popular: true,
      icon: Zap
    },
    {
      name: "Entreprise",
      price: "Sur mesure",
      period: "",
      description: "Solutions personnalisées",
      features: [
        "Requêtes illimitées",
        "APIs privées",
        "SLA garantie 99.9%",
        "Support dédié 24/7",
        "Pas de limite de débit",
        "Intégration sur mesure",
        "Formation équipe",
        "Contrat personnalisé"
      ],
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
      textColor: "text-gray-900",
      buttonVariant: "default" as const,
      popular: false,
      icon: Crown
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  const currentPlans = activeTab === 'business' ? businessPlans : apiPlans;

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* En-tête de section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tarifs
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              transparents et flexibles
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choisissez le plan qui correspond à vos besoins. Changez ou annulez à tout moment.
          </p>

          {/* Onglets */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-xl p-1 shadow-lg">
              <button
                onClick={() => setActiveTab('business')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'business'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Plans Business
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'api'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Plans API
              </button>
            </div>
          </div>
        </motion.div>

        {/* Grille des plans */}
        <motion.div 
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {currentPlans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <motion.div
                key={`${activeTab}-${index}`}
                variants={cardVariants}
                whileHover={{ 
                  scale: plan.popular ? 1.05 : 1.02,
                  transition: { duration: 0.2 }
                }}
                className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {plan.popular && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                  >
                    <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 text-sm font-semibold">
                      ⭐ Recommandé
                    </Badge>
                  </motion.div>
                )}
                
                <Card className={`h-full ${plan.bgColor} border-2 ${
                  plan.popular 
                    ? 'border-indigo-200 shadow-xl' 
                    : 'border-gray-100 shadow-lg hover:shadow-xl'
                } transition-all duration-300 overflow-hidden`}>
                  <CardHeader className="text-center pb-4">
                    <motion.div 
                      className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white shadow-md flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <IconComponent className={`w-6 h-6 bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`} />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price === 'Sur mesure' ? '' : plan.price + ' FCFA'}
                      </span>
                      {plan.price === 'Sur mesure' ? (
                        <span className="text-2xl font-bold text-gray-900">Sur mesure</span>
                      ) : (
                        <span className="text-gray-600">{plan.period}</span>
                      )}
                    </div>
                    
                    <p className="text-gray-600">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: 0.1 * featureIndex 
                          }}
                          className="flex items-start"
                        >
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant={plan.buttonVariant}
                        className={`w-full h-12 font-semibold text-lg ${
                          plan.buttonVariant === 'default'
                            ? `bg-gradient-to-r ${plan.color} hover:opacity-90 text-white shadow-lg hover:shadow-xl`
                            : 'border-2 border-gray-300 hover:border-gray-400'
                        } transition-all duration-300`}
                      >
                        {plan.price === 'Sur mesure' ? 'Nous contacter' : 'Commencer'}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Section garantie */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Garantie satisfait ou remboursé
            </h3>
            <p className="text-gray-600">
              Essayez ECOSYSTE sans risque pendant 30 jours. Si vous n'êtes pas satisfait, nous vous remboursons intégralement.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}