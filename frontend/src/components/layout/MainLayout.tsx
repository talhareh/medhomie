import { ReactNode } from 'react';
import MedicMenu from '../../pages/medicMaterial/MedicMenu';
import { Sidebar } from './Sidebar';
import MedicalAIBot from '../common/MedicalAIBot';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <MedicMenu />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      {/* <MedicalAIBot /> */}
    </div>
  );
};
