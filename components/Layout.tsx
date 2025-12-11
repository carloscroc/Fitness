
import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Compass, Utensils, Users } from 'lucide-react';
import { AppView } from '../types.ts';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onLogClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange, onLogClick }) => {
  const navItems = [
    { id: AppView.DASHBOARD, icon: LayoutGrid, label: 'Home' },
    { id: AppView.COACH, icon: Compass, label: 'Coach' },
    { id: AppView.NUTRITION, icon: Utensils, label: 'Food' },
    { id: AppView.SOCIAL, icon: Users, label: 'Social' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased relative selection:bg-blue-500/30">
      
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-black" />
          
          {/* Subtle Background Image for Texture */}
          <img 
            src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2000&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-color-dodge"
            alt="Background"
          />

          {/* Cinematic Light Curves */}
          <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[60%] rounded-[100%] bg-purple-900/20 blur-[150px] mix-blend-screen" />
          
          {/* Main Light Leak Curve */}
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[150%] h-[300px] bg-gradient-to-r from-transparent via-purple-500/10 to-transparent blur-[80px] rotate-[-12deg] mix-blend-screen" />
          
          <div className="absolute top-[30%] right-[-20%] w-[80%] h-[80%] rounded-full bg-orange-900/10 blur-[120px] mix-blend-screen" />
          
          {/* Dark Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/95" />
      </div>

      {/* Mobile Floating Bottom Bar */}
      <nav className="fixed bottom-5 left-5 right-5 md:hidden z-[100] bg-[#1C1C1E]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl">
          <div className="flex items-center justify-around h-[68px] px-2">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id as AppView)}
                    className="flex flex-col items-center justify-center w-14 h-full group relative"
                  >
                    <div className={`transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                       <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} />
                    </div>
                    {isActive && (
                       <div className="absolute bottom-2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_white]" />
                    )}
                  </button>
                )
              })}
          </div>
      </nav>

      {/* Main Content */}
      <main className="md:pl-[260px] relative z-10 max-w-7xl mx-auto min-h-screen pb-[120px] md:pb-0">
        <motion.div
          key={currentView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
