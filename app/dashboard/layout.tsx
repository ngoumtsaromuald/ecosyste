import { Metadata } from 'next';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardHeader } from './components/DashboardHeader';

export const metadata: Metadata = {
  title: 'Dashboard Business - RomAPI',
  description: 'Gérez votre fiche entreprise, suivez vos performances et accédez aux analytics.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="flex">
        <DashboardSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}