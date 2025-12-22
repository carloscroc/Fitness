
import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Bell, Zap, Heart, Calendar, Info } from 'lucide-react';

interface NotificationsModalProps {
  onClose: () => void;
}

const NOTIFICATIONS = [
  { 
    id: 1, 
    type: 'COACH', 
    title: 'Plan Updated', 
    text: 'Coach J added "Intensification Phase" to your schedule.', 
    time: '2m ago', 
    isRead: false 
  },
  { 
    id: 2, 
    type: 'SOCIAL', 
    title: 'New Like', 
    text: 'Sarah and 3 others liked your post "Leg day complete..."', 
    time: '1h ago', 
    isRead: false 
  },
  { 
    id: 3, 
    type: 'SYSTEM', 
    title: 'Weekly Report', 
    text: 'Your weekly analytics are ready. You lifted 12k lbs!', 
    time: '5h ago', 
    isRead: true 
  },
  { 
    id: 4, 
    type: 'REMINDER', 
    title: 'Log Lunch', 
    text: 'It looks like you haven\'t logged your post-workout meal yet.', 
    time: '6h ago', 
    isRead: true 
  },
];

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'COACH': return <Zap size={18} className="text-yellow-500" />;
      case 'SOCIAL': return <Heart size={18} className="text-red-500" />;
      case 'SYSTEM': return <Info size={18} className="text-blue-500" />;
      case 'REMINDER': return <Calendar size={18} className="text-green-500" />;
      default: return <Bell size={18} className="text-gray-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'COACH': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'SOCIAL': return 'bg-red-500/10 border-red-500/20';
      case 'SYSTEM': return 'bg-blue-500/10 border-blue-500/20';
      case 'REMINDER': return 'bg-green-500/10 border-green-500/20';
      default: return 'bg-[#2C2C2E] border-white/5';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-start justify-center pt-20 px-4 pointer-events-none">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
      />
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-[#1C1C1E] w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-white/10 pointer-events-auto flex flex-col max-h-[70vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-[#1C1C1E] shrink-0">
           <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
             <Bell size={18} /> Notifications
           </h2>
           <button 
             onClick={onClose} 
             className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-colors"
           >
             <X size={16} />
           </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
           {NOTIFICATIONS.map((item) => (
             <div 
               key={item.id} 
               className={`p-4 rounded-[24px] border relative group transition-all hover:bg-white/5 ${getBgColor(item.type)}`}
             >
                {!item.isRead && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3B82F6]" />
                )}
                
                <div className="flex gap-3">
                   <div className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center border border-white/5 shrink-0">
                      {getIcon(item.type)}
                   </div>
                   <div>
                      <div className="flex justify-between items-start pr-4">
                         <h4 className="text-sm font-bold text-white mb-0.5">{item.title}</h4>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed mb-1.5">{item.text}</p>
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">{item.time}</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
        
        <div className="p-3 border-t border-white/5 bg-[#1C1C1E] text-center">
           <button className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
              Mark all as read
           </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default NotificationsModal;
