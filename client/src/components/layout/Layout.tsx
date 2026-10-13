import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
  lowResourceMode: boolean;
  setLowResourceMode: (val: boolean) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, lowResourceMode, setLowResourceMode }) => {
  return (
    <div className={`min-h-screen bg-cream-50 text-slate-800 ${lowResourceMode ? 'low-resource-mode' : ''}`}>
      <Header lowResourceMode={lowResourceMode} setLowResourceMode={setLowResourceMode} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-3 sm:p-6 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
