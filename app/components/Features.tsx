'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Search, 
  BarChart3, 
  Smartphone, 
  Shield, 
  Zap, 
  Globe, 
  Users,
  Clock,
  Star
} from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: FileText,
      title: "Gestion des fiches",
      description: "Créez et gérez facilement vos fiches d'entreprise avec notre interface intuitive.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: Search,
      title: "Recherche avancée",
      description: "Trouvez exactement ce que vous cherchez grâce à nos filtres intelligents et géolocalisation.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      icon: BarChart3,
      title: "Analytics détaillés",
      description: "Suivez vos performances avec des tableaux de bord complets et des insights précieux.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: Smartphone,
      title: "Mobile Money",
      description: "Intégration native avec les services de paiement mobile populaires au Cameroun.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      icon: Shield,
      title: "Sécurité renforcée",
      description: "Protection des données avec chiffrement de bout en bout et authentification sécurisée.",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600"
    },
    {
      icon: Zap,
      title: "Performance optimale",
      description: "APIs ultra-rapides avec temps de réponse < 100ms et disponibilité 99.9%.",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600"
    },
    {
      icon: Globe,
      title: "Couverture nationale",
      description: "Données complètes sur toutes les régions du Cameroun avec mises à jour en temps réel.",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600"
    },
    {
      icon: Users,
      title: "Communauté active",
      description: "Rejoignez une communauté de développeurs et entrepreneurs passionnés.",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600"
    },
    {
      icon: Clock,
      title: "Support 24/7",
      description: "Équipe de support dédiée disponible pour vous accompagner à tout moment.",
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600"
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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section className="py-20 bg-white">
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
            Fonctionnalités
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              qui font la différence
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez tous les outils et services qui font d'ECOSYSTE la plateforme de référence pour l'écosystème entrepreneurial camerounais.
          </p>
        </motion.div>

        {/* Grille des fonctionnalités */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className="group"
              >
                <Card className="h-full bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    {/* Icône avec animation */}
                    <motion.div 
                      className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{
                        rotate: [0, -5, 5, 0],
                        transition: { duration: 0.4 }
                      }}
                    >
                      <motion.div
                        whileHover={{
                          scale: [1, 1.2, 1],
                          transition: { duration: 0.3 }
                        }}
                      >
                        <IconComponent className={`w-7 h-7 ${feature.iconColor}`} />
                      </motion.div>
                    </motion.div>

                    {/* Titre */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Barre de gradient en bas */}
                    <div className={`h-1 bg-gradient-to-r ${feature.color} mt-4 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Section CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12">
            <motion.div
              whileInView={{ scale: [0.8, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            </motion.div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Prêt à découvrir toutes nos fonctionnalités ?
            </h3>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Explorez ECOSYSTE dès maintenant et découvrez comment nous pouvons transformer votre présence digitale.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Commencer l'exploration
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}