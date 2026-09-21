import type { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import InstallBanner from './InstallBanner';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Bandeau tout en haut, pleine largeur */}
      <InstallBanner />

      <div className="flex">
        <Sidebar />
        <div className="flex-1 md:ml-64">
          <Header />
          <main className="p-3 md:p-6 pb-24 md:pb-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}