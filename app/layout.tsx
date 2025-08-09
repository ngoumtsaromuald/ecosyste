import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ErrorBoundary from './components/ErrorBoundary';
import ClientOnly from './components/ClientOnly';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RomAPI - Écosystème d\'API Commercial Cameroun',
  description: 'Catalogue d\'entreprises et services locaux au Cameroun. Trouvez facilement les entreprises près de chez vous.',
  keywords: 'Cameroun, entreprises, services, annuaire, business, local',
  authors: [{ name: 'Romuald' }],
  openGraph: {
    title: 'RomAPI - Catalogue d\'entreprises Cameroun',
    description: 'Découvrez les entreprises et services locaux au Cameroun',
    type: 'website',
    locale: 'fr_CM',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ClientOnly fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <ErrorBoundary>
            <div className="min-h-screen bg-gray-50">
              {children}
            </div>
          </ErrorBoundary>
        </ClientOnly>
      </body>
    </html>
  );
}