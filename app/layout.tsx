import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ErrorBoundary from './components/ErrorBoundary';
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
    <html lang="fr" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <ErrorBoundary>
          <div className="min-h-screen">
            {children}
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}