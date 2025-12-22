
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, ChevronLeft, User, Mail, Lock, Eye, EyeOff, LayoutGrid, GripVertical, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button.tsx';

export type SettingsType = 'PERSONAL' | 'LAYOUT' | 'SECURITY';

interface ProfileSettingsModalProps {
  type: SettingsType;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ type, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Personal State
  const [name, setName] = useState('Alex Runner');
  const [bio, setBio] = useState('Fitness enthusiast on a journey to strength and wellness.');
  
  // Security State
  const [showPassword, setShowPassword] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  
  // Layout State
  const [layoutItems, setLayoutItems] = useState([
    { id: 'schedule', label: 'Daily Schedule', enabled: true },
    { id: 'metrics', label: 'Activity Metrics', enabled: true },
    { id: 'nutrition', label: 'Nutrition Summary', enabled: true },
    { id: 'suggestions', label: 'Coach Suggestions', enabled: false },
  ]);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSaved(true);
      setTimeout(() => {
          setIsSaved(false);
          onClose();
      }, 800);
    }, 1000);
  };

  const renderContent = () => {
    switch (type) {
      case 'PERSONAL':
        return (
          <div className="space-y-6">
             <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-[#1C1C1E] border border-white/10 relative overflow-hidden mb-3 group cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt="Profile" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Edit</span>
                    </div>
                </div>
                <button className="text-[#0A84FF] text-sm font-bold hover:text-blue-400 transition-colors">Change Photo</button>
             </div>

             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Display Name</label>
                   <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium focus:outline-none focus:border-[#0A84FF]/50 focus:bg-black/50 transition-colors"
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Bio</label>
                   <textarea 
                     value={bio}
                     onChange={(e) => setBio(e.target.value)}
                     className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 text-white font-medium focus:outline-none focus:border-[#0A84FF]/50 min-h-[120px] resize-none focus:bg-black/50 transition-colors"
                   />
                </div>
             </div>
          </div>
        );
      
      case 'LAYOUT':
         return (
             <div className="space-y-6">
                 <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-2">
                    <h4 className="text-blue-400 text-sm font-bold mb-1 flex items-center gap-2">
                        <LayoutGrid size={16} /> Dashboard Customization
                    </h4>
                    <p className="text-xs text-blue-200/70 leading-relaxed">
                        Toggle visibility of sections on your home dashboard. Custom ordering coming soon.
                    </p>
                 </div>

                 <div className="space-y-3">
                     {layoutItems.map(item => (
                         <div key={item.id} className="flex items-center justify-between p-4 bg-[#1C1C1E] border border-white/5 rounded-2xl active:bg-[#2C2C2E] transition-colors cursor-pointer group hover:border-white/10" onClick={() => setLayoutItems(items => items.map(i => i.id === item.id ? {...i, enabled: !i.enabled} : i))}>
                             <div className="flex items-center gap-4">
                                 <div className="text-zinc-600 cursor-grab active:cursor-grabbing p-1 hover:text-zinc-400 transition-colors">
                                     <GripVertical size={20} />
                                 </div>
                                 <span className={`font-bold text-sm ${item.enabled ? 'text-white' : 'text-zinc-500'}`}>{item.label}</span>
                             </div>
                             <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${item.enabled ? 'bg-[#30D158]' : 'bg-zinc-800'}`}>
                                 <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${item.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
         );

      case 'SECURITY':
          return (
              <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                            type="email" 
                            value="alex@example.com"
                            disabled
                            className="w-full bg-[#1C1C1E]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-zinc-400 font-medium cursor-not-allowed"
                        />
                    </div>
                  </div>

                  <div className="h-px bg-white/5 my-2" />

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Current Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                            type="password" 
                            value={currentPass}
                            onChange={(e) => setCurrentPass(e.target.value)}
                            className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium focus:outline-none focus:border-[#0A84FF]/50 focus:bg-black/50 transition-colors placeholder-zinc-700"
                            placeholder="••••••••"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white font-medium focus:outline-none focus:border-[#0A84FF]/50 focus:bg-black/50 transition-colors placeholder-zinc-700"
                            placeholder="Enter new password"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-2"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                  </div>
              </div>
          );
    }
  };

  const getTitle = () => {
      switch(type) {
          case 'PERSONAL': return 'Personal Info';
          case 'LAYOUT': return 'Dashboard Layout';
          case 'SECURITY': return 'Email & Password';
      }
  };

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-end md:items-center justify-center pointer-events-none"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto" onClick={onClose} />
      
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="pointer-events-auto bg-[#000000] w-full md:w-[500px] h-[90vh] md:h-auto md:max-h-[85vh] rounded-t-[32px] md:rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col border border-white/10"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-[#1C1C1E] shrink-0">
           <div className="flex items-center gap-3">
               <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <ChevronLeft size={18} />
               </button>
               <h2 className="text-lg font-bold font-display text-white">{getTitle()}</h2>
           </div>
           <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 transition-colors">
              <X size={18} />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-black">
            {renderContent()}
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#1C1C1E] border-t border-white/10 safe-area-bottom">
            <Button 
                onClick={handleSave} 
                isLoading={isLoading} 
                className={`w-full h-14 rounded-[20px] text-lg font-bold transition-all ${isSaved ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}
            >
               {isSaved ? <span className="flex items-center gap-2"><CheckCircle2 size={20} /> Saved</span> : isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default ProfileSettingsModal;
