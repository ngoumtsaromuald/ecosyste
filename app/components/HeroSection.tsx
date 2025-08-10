'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-start overflow-hidden pt-16">
      {/* Arrière-plan avec gradient moderne */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800" />
      
      {/* Overlay avec motif */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Zone dédiée pour animations futures (unicorn.studio ou équivalent) */}
      <div 
        id="hero-animation-container" 
        className="absolute inset-0 z-10 pointer-events-none"
        data-animation-ready="false"
        aria-label="Container for future interactive animations"
      >
        {/* Particules flottantes animées */}
        <motion.div 
          className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-32 w-1 h-1 bg-pink-300/40 rounded-full"
          animate={{
            x: [0, 15, 0],
            y: [0, -10, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute bottom-32 left-1/4 w-3 h-3 bg-indigo-300/30 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-300/40 rounded-full"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Contenu principal aligné à gauche */}
      <div className="relative z-20 container mx-auto px-4 py-20">
        <div className="max-w-4xl text-white">
          {/* Titre principal aligné en bas à gauche */}
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
          >
            <span className="block">
              Toutes les entreprises
            </span>
            <span className="block">
              locales.
            </span>
            <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
              Une seule API.
            </span>
          </motion.h1>

          {/* Sous-titre */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl leading-relaxed"
          >
            ECOSYSTE connecte entreprises, développeurs et utilisateurs grâce à des données locales fiables et mises à jour.
          </motion.p>

          {/* Boutons CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="h-14 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Découvrir ECOSYSTE
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold text-lg backdrop-blur-sm transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2" />
                Essayer gratuitement
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>


    </section>
  );
}