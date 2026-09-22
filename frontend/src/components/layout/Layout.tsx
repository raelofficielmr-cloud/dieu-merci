import type { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar />

      <div className="md:ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-3 md:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}