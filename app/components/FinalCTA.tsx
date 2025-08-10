'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Arrière-plan avec gradient animé */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800"
          animate={{
            background: [
              'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #be185d 100%)',
              'linear-gradient(135deg, #7c3aed 0%, #be185d 50%, #1e3a8a 100%)',
              'linear-gradient(135deg, #be185d 0%, #1e3a8a 50%, #7c3aed 100%)',
              'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #be185d 100%)'
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Particules flottantes */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Badge animé */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex justify-center"
          >
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(99, 102, 241, 0.3)',
                  '0 0 40px rgba(99, 102, 241, 0.6)',
                  '0 0 20px rgba(99, 102, 241, 0.3)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 flex items-center space-x-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              >
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </motion.div>
              <span className="text-white font-semibold">Rejoignez l'écosystème digital du Cameroun</span>
            </motion.div>
          </motion.div>

          {/* Titre principal */}
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight"
          >
            <span className="block">
              Prêt à connecter votre entreprise
            </span>
            <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
              au Cameroun numérique ?
            </span>
          </motion.h2>

          {/* Sous-titre */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed"
          >
            Rejoignez des centaines d'entreprises qui font déjà confiance à ECOSYSTE pour développer leur présence digitale et atteindre de nouveaux clients.
          </motion.p>

          {/* Bouton CTA principal */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(99, 102, 241, 0.4)',
                    '0 0 60px rgba(99, 102, 241, 0.8)',
                    '0 0 30px rgba(99, 102, 241, 0.4)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="rounded-2xl"
              >
                <Button
                  size="lg"
                  className="h-16 px-12 bg-gradient-to-r from-white to-gray-100 text-gray-900 hover:from-gray-100 hover:to-white font-bold text-xl shadow-2xl transition-all duration-300 rounded-2xl group"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="mr-3"
                  >
                    <Zap className="w-6 h-6 text-yellow-500" />
                  </motion.div>
                  Commencer maintenant
                  <motion.div
                    className="ml-3 group-hover:translate-x-1 transition-transform duration-300"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Statistiques finales */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <motion.div 
                className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"
                whileInView={{ scale: [0.5, 1.1, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                5 min
              </motion.div>
              <p className="text-blue-100 font-medium">Configuration rapide</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <motion.div 
                className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent"
                whileInView={{ scale: [0.5, 1.1, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                24/7
              </motion.div>
              <p className="text-blue-100 font-medium">Support disponible</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <motion.div 
                className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent"
                whileInView={{ scale: [0.5, 1.1, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                30 jours
              </motion.div>
              <p className="text-blue-100 font-medium">Garantie remboursement</p>
            </motion.div>
          </motion.div>
        </div>
      </div>


    </section>
  );
}