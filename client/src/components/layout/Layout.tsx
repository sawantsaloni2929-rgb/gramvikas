import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-cream-50 text-slate-800">
      <Header />
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
