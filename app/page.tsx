import { Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ValueProposition } from './components/ValueProposition';
import { Features } from './components/Features';
import { Pricing } from './components/Pricing';
import { Testimonials } from './components/Testimonials';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Value Proposition Section */}
      <ValueProposition />
      
      {/* Features Section */}
      <Features />
      
      {/* Pricing Section */}
      <Pricing />
      
      {/* Testimonials Section */}
      <Testimonials />
      
      {/* Final CTA Section */}
      <FinalCTA />
      
      {/* Footer */}
      <Footer />
    </main>
  );
}