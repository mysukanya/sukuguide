import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-textNormal flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={onNavigate}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentView={currentView}
          onToggleMobileNav={() => setMobileNavOpen(prev => !prev)}
          onNavigate={onNavigate}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-grid-cyber">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
