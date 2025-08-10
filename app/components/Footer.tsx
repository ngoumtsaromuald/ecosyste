'use client';

import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart
} from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const footerLinks = {
    company: {
      title: "Entreprise",
      links: [
        { name: "À propos", href: "/about" },
        { name: "Notre équipe", href: "/team" },
        { name: "Carrières", href: "/careers" },
        { name: "Presse", href: "/press" },
        { name: "Partenaires", href: "/partners" }
      ]
    },
    product: {
      title: "Produit",
      links: [
        { name: "Fonctionnalités", href: "/features" },
        { name: "Tarifs", href: "/pricing" },
        { name: "API Documentation", href: "/docs" },
        { name: "Intégrations", href: "/integrations" },
        { name: "Statut", href: "/status" }
      ]
    },
    resources: {
      title: "Ressources",
      links: [
        { name: "Blog", href: "/blog" },
        { name: "Centre d'aide", href: "/help" },
        { name: "Guides", href: "/guides" },
        { name: "Webinaires", href: "/webinars" },
        { name: "Communauté", href: "/community" }
      ]
    },
    legal: {
      title: "Légal",
      links: [
        { name: "Politique de confidentialité", href: "/privacy" },
        { name: "Conditions d'utilisation", href: "/terms" },
        { name: "Mentions légales", href: "/legal" },
        { name: "Cookies", href: "/cookies" },
        { name: "RGPD", href: "/gdpr" }
      ]
    }
  };

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://facebook.com/ecosyste",
      color: "hover:text-blue-600",
      bgColor: "hover:bg-blue-50"
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: "https://twitter.com/ecosyste",
      color: "hover:text-sky-500",
      bgColor: "hover:bg-sky-50"
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://instagram.com/ecosyste",
      color: "hover:text-pink-600",
      bgColor: "hover:bg-pink-50"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://linkedin.com/company/ecosyste",
      color: "hover:text-blue-700",
      bgColor: "hover:bg-blue-50"
    },
    {
      name: "YouTube",
      icon: Youtube,
      href: "https://youtube.com/ecosyste",
      color: "hover:text-red-600",
      bgColor: "hover:bg-red-50"
    }
  ];

  const contactInfo = [
    {
      icon: Mail,
      text: "contact@ecosyste.cm",
      href: "mailto:contact@ecosyste.cm"
    },
    {
      icon: Phone,
      text: "+237 6XX XXX XXX",
      href: "tel:+2376XXXXXXX"
    },
    {
      icon: MapPin,
      text: "Douala, Cameroun",
      href: "#"
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        {/* Section principale */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Colonne de gauche - Branding */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  ECOSYSTE
                </h3>
                <p className="text-gray-400 mt-4 leading-relaxed">
                  La plateforme qui connecte l'écosystème entrepreneurial camerounais. Découvrez, collaborez et grandissez ensemble.
                </p>
              </div>

              {/* Informations de contact */}
              <div className="space-y-3 mb-6">
                {contactInfo.map((contact, index) => {
                  const IconComponent = contact.icon;
                  return (
                    <motion.a
                      key={index}
                      href={contact.href}
                      whileHover={{ x: 5 }}
                      className="flex items-center text-gray-400 hover:text-white transition-colors duration-300 group"
                    >
                      <IconComponent className="w-4 h-4 mr-3 group-hover:text-indigo-400 transition-colors duration-300" />
                      <span>{contact.text}</span>
                    </motion.a>
                  );
                })}
              </div>

              {/* Réseaux sociaux */}
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 transition-all duration-300 ${social.color} ${social.bgColor}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            {/* Colonnes de liens */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-8">
              {Object.entries(footerLinks).map(([key, section]) => (
                <motion.div key={key} variants={itemVariants}>
                  <h4 className="text-lg font-semibold mb-4 text-white">
                    {section.title}
                  </h4>
                  <ul className="space-y-3">
                    {section.links.map((link, index) => (
                      <motion.li key={index}>
                        <Link
                          href={link.href}
                          className="text-gray-400 hover:text-white transition-colors duration-300 hover:underline"
                        >
                          {link.name}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <Separator className="bg-gray-800" />

        {/* Section newsletter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-12"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Restez informé des dernières nouveautés
            </h3>
            <p className="text-gray-400 mb-6">
              Recevez nos actualités, conseils et mises à jour directement dans votre boîte mail.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                S'abonner
              </motion.button>
            </div>
          </div>
        </motion.div>

        <Separator className="bg-gray-800" />

        {/* Section copyright */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 ECOSYSTE. Tous droits réservés.
            </div>
            
            <div className="flex items-center text-gray-400 text-sm">
              <span>Fait avec</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="mx-1"
              >
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              </motion.div>
              <span>au Cameroun</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}