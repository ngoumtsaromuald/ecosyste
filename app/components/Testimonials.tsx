'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Star, Quote } from 'lucide-react';
import { useEffect, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';

export function Testimonials() {
  const testimonials = [
    {
      name: "Marie Kouam",
      role: "Propriétaire, Restaurant Le Savoureux",
      company: "Douala",
      content: "ECOSYSTE a transformé notre visibilité en ligne. Nous recevons maintenant 3 fois plus de clients grâce à leur plateforme. L'interface est intuitive et le support client exceptionnel.",
      rating: 5,
      avatar: "/api/placeholder/64/64",
      initials: "MK"
    },
    {
      name: "Jean-Paul Mbarga",
      role: "Développeur Full-Stack",
      company: "TechCorp Yaoundé",
      content: "Les APIs d'ECOSYSTE sont remarquablement bien documentées et stables. L'intégration dans nos projets s'est faite en quelques heures seulement. Un vrai gain de temps !",
      rating: 5,
      avatar: "/api/placeholder/64/64",
      initials: "JPM"
    },
    {
      name: "Fatima Ndjock",
      role: "Directrice Marketing",
      company: "BeautyShop Bafoussam",
      content: "Grâce aux analytics d'ECOSYSTE, nous comprenons mieux notre clientèle. Les rapports détaillés nous aident à optimiser nos campagnes marketing avec des résultats impressionnants.",
      rating: 5,
      avatar: "/api/placeholder/64/64",
      initials: "FN"
    },
    {
      name: "Samuel Tchoumi",
      role: "CEO",
      company: "InnovTech Solutions",
      content: "L'écosystème ECOSYSTE nous a permis de connecter notre startup avec des partenaires locaux. La plateforme facilite vraiment les collaborations business au Cameroun.",
      rating: 5,
      avatar: "/api/placeholder/64/64",
      initials: "ST"
    },
    {
      name: "Aminata Bello",
      role: "Développeuse Mobile",
      company: "AppCraft Studio",
      content: "L'intégration Mobile Money via l'API ECOSYSTE a révolutionné nos applications. Nos utilisateurs peuvent maintenant effectuer des paiements en toute simplicité.",
      rating: 5,
      avatar: "/api/placeholder/64/64",
      initials: "AB"
    },
    {
      name: "Pierre Fotso",
      role: "Gérant",
      company: "Électronique Plus",
      content: "Depuis que nous utilisons ECOSYSTE, notre chiffre d'affaires a augmenté de 40%. La géolocalisation nous amène des clients que nous n'aurions jamais touchés autrement.",
      rating: 5,
      avatar: "/api/placeholder/64/64",
      initials: "PF"
    }
  ];

  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
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
            Ce que disent
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              nos utilisateurs
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les témoignages de entrepreneurs et développeurs qui font confiance à ECOSYSTE pour développer leur activité.
          </p>
        </motion.div>

        {/* Carrousel de témoignages */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <Carousel
            setApi={setApi}
            className="w-full"
            plugins={[
              Autoplay({
                delay: 5000,
                stopOnInteraction: true,
              }),
            ]}
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <Card className="h-full bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Quote icon */}
                        <motion.div 
                          className="mb-4"
                          whileHover={{ rotate: 180 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Quote className="w-8 h-8 text-indigo-600 opacity-60" />
                        </motion.div>

                        {/* Rating */}
                        <div className="flex mb-4">
                          {renderStars(testimonial.rating)}
                        </div>

                        {/* Content */}
                        <blockquote className="text-gray-700 leading-relaxed mb-6 flex-grow">
                          "{testimonial.content}"
                        </blockquote>

                        {/* Author */}
                        <div className="flex items-center">
                          <motion.div
                            whileHover={{ 
                              rotateY: 15,
                              rotateX: 15,
                              scale: 1.1
                            }}
                            transition={{ duration: 0.3 }}
                            className="mr-4"
                          >
                            <Avatar className="w-12 h-12 border-2 border-indigo-100">
                              <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                              <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
                                {testimonial.initials}
                              </AvatarFallback>
                            </Avatar>
                          </motion.div>
                          
                          <div>
                            <div className="font-semibold text-gray-900">
                              {testimonial.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {testimonial.role}
                            </div>
                            <div className="text-sm text-indigo-600 font-medium">
                              {testimonial.company}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <div className="hidden md:block">
              <CarouselPrevious className="-left-12 bg-white shadow-lg border-gray-200 hover:bg-gray-50" />
              <CarouselNext className="-right-12 bg-white shadow-lg border-gray-200 hover:bg-gray-50" />
            </div>
          </Carousel>

          {/* Indicateurs */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  current === index
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
        </motion.div>

        {/* Section statistiques */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <div className="space-y-2">
            <motion.div 
              className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              whileInView={{ scale: [0.5, 1.1, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              4.9/5
            </motion.div>
            <p className="text-gray-600 font-medium">Note moyenne</p>
            <div className="flex justify-center">
              {renderStars(5)}
            </div>
          </div>
          
          <div className="space-y-2">
            <motion.div 
              className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
              whileInView={{ scale: [0.5, 1.1, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              98%
            </motion.div>
            <p className="text-gray-600 font-medium">Clients satisfaits</p>
          </div>
          
          <div className="space-y-2">
            <motion.div 
              className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent"
              whileInView={{ scale: [0.5, 1.1, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              1000+
            </motion.div>
            <p className="text-gray-600 font-medium">Avis positifs</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}