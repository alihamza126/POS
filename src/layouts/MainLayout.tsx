import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1600px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
