
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Settings, User, Bell, Shield, Smartphone, 
  LogOut, ChevronRight, CreditCard, Moon, Scale, Mail,
  BookOpen, PlayCircle, HelpCircle, Zap, LayoutGrid, Compass
} from 'lucide-react';
import { AppView } from '../types.ts';
import { Button } from '../components/ui/Button.tsx';
import { LazyHelpCenter } from '../components/LazyModal.tsx';
import { LazySubscriptionModal } from '../components/LazyModal.tsx';
import { LazyProfileSettingsModal } from '../components/LazyModal.tsx';

// Import SettingsType type from the actual component
import type { SettingsType } from '../components/ProfileSettingsModal.tsx';

interface ProfileProps {
  onNavigate: (view: AppView) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  // Modals
  const [helpTab, setHelpTab] = useState<'TUTORIALS' | 'GUIDE' | 'SUPPORT' | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  
  // Settings State
  const [settingsModal, setSettingsModal] = useState<{ isOpen: boolean; type: SettingsType | null }>({ isOpen: false, type: null });

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const openSettings = (type: SettingsType) => {
      setSettingsModal({ isOpen: true, type });
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-[11px] font-extrabold text-[#555] dark:text-[#666] uppercase tracking-widest mb-3 px-1 mt-8">{title}</h3>
  );

  const SettingRow = ({ icon: Icon, label, value, type = 'link', onClick }: any) => (
    <div 
      onClick={onClick}
      className="flex items-center justify-between px-5 py-4 bg-[#1C1C1E] border-b border-white/5 last:border-none active:bg-[#2C2C2E] transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <Icon size={20} strokeWidth={2} className="text-zinc-400 group-hover:text-white transition-colors" />
        <span className="text-[15px] font-bold text-white">{label}</span>
      </div>
      
      <div className="flex items-center gap-3">
        {value && <span className="text-[13px] text-zinc-500 font-medium">{value}</span>}
        {type === 'toggle' ? (
          <div className={`w-11 h-6 rounded-full relative transition-colors ${value ? 'bg-white' : 'bg-zinc-700'}`}>
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-sm transition-transform ${value ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'}`} />
          </div>
        ) : (
          <ChevronRight size={16} className="text-zinc-600" />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black pb-10 font-sans text-white">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/5 pt-[env(safe-area-inset-top)]">
        <div className="px-5 py-3 flex items-center justify-between">
          <button 
            onClick={() => onNavigate(AppView.DASHBOARD)} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1C1C1E] border border-white/10 text-white hover:bg-[#2C2C2E] transition-colors active:scale-95"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <h1 className="text-[17px] font-bold text-white">Profile</h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent text-white hover:bg-[#1C1C1E] transition-colors">
            <Settings size={22} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="p-5 max-w-2xl mx-auto">
        
        {/* Profile Hero - Updated to match screenshot */}
        <div className="flex flex-col items-center pt-2 pb-8">
          <div className="relative mb-4">
             <div className="w-[100px] h-[100px] rounded-full p-1 bg-[#1C1C1E] shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop" 
                  className="w-full h-full object-cover rounded-full"
                  alt="Profile"
                />
             </div>
             {/* Small User Icon Badge */}
             <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-black">
                <User size={14} className="text-black" strokeWidth={2.5} />
             </div>
          </div>
          
          <h2 className="text-[22px] font-bold font-display text-white tracking-tight mb-1">Alex Runner</h2>
          <p className="text-zinc-500 text-[13px] font-bold tracking-wide">Joined October 2023</p>
        </div>

        {/* Premium Membership Card - Updated to match screenshot */}
        <div 
           onClick={() => setIsSubscriptionModalOpen(true)}
           className="relative overflow-hidden rounded-[32px] bg-[#0A0A0C] border border-white/10 h-[140px] flex items-center cursor-pointer active:scale-[0.98] transition-transform group mb-8"
        >
           {/* Dark Blue Orb/Shape on the right */}
           <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full bg-[#1e1b4b] blur-[40px] opacity-80 group-hover:opacity-100 transition-opacity" />
           
           <div className="relative z-10 w-full px-6 flex justify-between items-center">
              <div>
                 {/* Pro Member Badge */}
                 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C1C1E] border border-white/10 mb-3 shadow-lg">
                    <CreditCard size={10} className="text-[#0A84FF]" fill="currentColor" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-white">Pro Member</span>
                 </div>
                 
                 <h3 className="text-[22px] font-bold font-display text-white mb-1 leading-tight">NeoFit Premium</h3>
                 <p className="text-zinc-500 text-xs font-bold tracking-wide">Renews on Nov 24, 2023</p>
              </div>

              {/* Arrow Button */}
              <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-white/10 group-hover:text-white transition-colors">
                 <ChevronRight size={20} />
              </div>
           </div>
        </div>

        {/* Stats Container - Updated to show Workout Metrics instead of Personal Stats */}
        <div className="bg-[#1C1C1E] rounded-[32px] border border-white/5 p-5 flex justify-between divide-x divide-white/5 mb-8 shadow-lg">
           {[
             { label: 'Workouts', value: '156' },
             { label: 'Volume', value: '920k' },
             { label: 'Hours', value: '142h' }
           ].map((stat, i) => (
             <div key={i} className="flex-1 text-center px-2 flex flex-col justify-center">
                <div className="text-[20px] font-bold font-display text-white tabular-nums tracking-tight">{stat.value}</div>
                <div className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest mt-1">{stat.label}</div>
             </div>
           ))}
        </div>

        {/* Settings Sections */}
        <div>
          <SectionHeader title="Account Settings" />
          <div className="bg-[#1C1C1E] rounded-[24px] border border-white/5 overflow-hidden">
             <SettingRow icon={User} label="Personal Information" onClick={() => openSettings('PERSONAL')} />
             <SettingRow icon={LayoutGrid} label="Dashboard Layout" onClick={() => openSettings('LAYOUT')} />
             <SettingRow icon={Mail} label="Email & Password" onClick={() => openSettings('SECURITY')} />
          </div>

          <SectionHeader title="Preferences" />
          <div className="bg-[#1C1C1E] rounded-[24px] border border-white/5 overflow-hidden">
             <SettingRow icon={Scale} label="Units" value="Imperial (lbs)" />
             <SettingRow icon={Compass} label="Gym Location" />
             <SettingRow icon={Moon} label="Dark Mode" type="toggle" value={darkMode} onClick={toggleDarkMode} />
          </div>

          <SectionHeader title="Support" />
          <div className="bg-[#1C1C1E] rounded-[24px] border border-white/5 overflow-hidden">
             <SettingRow icon={HelpCircle} label="Help & Resources" onClick={() => setHelpTab('TUTORIALS')} />
             <div className="flex items-center justify-between px-5 py-4 bg-[#1C1C1E] active:bg-[#2C2C2E] transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                   <LogOut size={20} strokeWidth={2} className="text-red-500" />
                   <span className="text-[15px] font-bold text-red-500">Log Out</span>
                </div>
             </div>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest pt-8 pb-8">NeoFit v1.4.2</p>

      </div>
      
      {/* Help Center Modal */}
      <AnimatePresence>
        {helpTab && (
            <LazyHelpCenter
                initialTab={helpTab}
                onClose={() => setHelpTab(null)}
            />
        )}
      </AnimatePresence>

      {/* Subscription Modal */}
      <AnimatePresence>
        {isSubscriptionModalOpen && (
            <LazySubscriptionModal onClose={() => setIsSubscriptionModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {settingsModal.isOpen && settingsModal.type && (
            <LazyProfileSettingsModal
                type={settingsModal.type}
                onClose={() => setSettingsModal({ isOpen: false, type: null })}
            />
        )}
      </AnimatePresence>

    </div>
  );
};
