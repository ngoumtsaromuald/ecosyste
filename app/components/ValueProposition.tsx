'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Code, Users, TrendingUp, Zap, MapPin } from 'lucide-react';

export function ValueProposition() {
  const propositions = [
    {
      icon: Building2,
      title: "Pour les entreprises",
      description: "Augmentez votre visibilité, accédez à des analytics détaillés et boostez votre promotion locale.",
      features: ["Visibilité accrue", "Analytics avancés", "Promotion ciblée"],
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: Code,
      title: "Pour les développeurs",
      description: "APIs documentées, SDKs prêts à l'emploi et intégration rapide pour vos projets.",
      features: ["APIs documentées", "SDKs complets", "Intégration rapide"],
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      icon: Users,
      title: "Pour les utilisateurs",
      description: "Recherche centralisée, interface responsive et géolocalisation précise pour trouver ce dont vous avez besoin.",
      features: ["Recherche centralisée", "Interface responsive", "Géolocalisation"],
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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
            Une plateforme,
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              trois écosystèmes
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ECOSYSTE s'adapte à vos besoins, que vous soyez entrepreneur, développeur ou utilisateur final.
          </p>
        </motion.div>

        {/* Grille des propositions de valeur */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {propositions.map((prop, index) => {
            const IconComponent = prop.icon;
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
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-8">
                    {/* Icône avec animation */}
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl ${prop.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{
                        rotate: [0, -10, 10, 0],
                        transition: { duration: 0.5 }
                      }}
                    >
                      <IconComponent className={`w-8 h-8 ${prop.iconColor}`} />
                    </motion.div>

                    {/* Titre */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {prop.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {prop.description}
                    </p>

                    {/* Liste des fonctionnalités */}
                    <ul className="space-y-3">
                      {prop.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ 
                            duration: 0.4, 
                            delay: 0.1 * featureIndex 
                          }}
                          className="flex items-center text-gray-700"
                        >
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${prop.color} mr-3`} />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>

                    {/* Barre de gradient en bas */}
                    <div className={`h-1 bg-gradient-to-r ${prop.color} mt-6 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Section statistiques */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <div className="space-y-2">
            <motion.div 
              className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              whileInView={{ scale: [0.5, 1.1, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              500+
            </motion.div>
            <p className="text-gray-600 font-medium">Entreprises connectées</p>
          </div>
          
          <div className="space-y-2">
            <motion.div 
              className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              whileInView={{ scale: [0.5, 1.1, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              50+
            </motion.div>
            <p className="text-gray-600 font-medium">Catégories de services</p>
          </div>
          
          <div className="space-y-2">
            <motion.div 
              className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
              whileInView={{ scale: [0.5, 1.1, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              99.9%
            </motion.div>
            <p className="text-gray-600 font-medium">Disponibilité API</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}