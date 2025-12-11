import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Droplets, Plus, Minus } from 'lucide-react';

interface HydrationModalProps {
  onClose: () => void;
}

export const HydrationModal: React.FC<HydrationModalProps> = ({ onClose }) => {
  const [intake, setIntake] = useState(4250); // Initial set to match screenshot context
  const GOAL = 2500;
  
  // Calculate percentage capped at 100 for visual liquid
  const visualPercentage = Math.min(Math.round((intake / GOAL) * 100), 100);
  const rawPercentage = Math.round((intake / GOAL) * 100);

  const updateIntake = (amount: number) => {
    setIntake(prev => Math.max(0, prev + amount));
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-[#1C1C1E] w-[90%] max-w-[340px] rounded-[32px] p-6 shadow-2xl border border-white/10 overflow-hidden flex flex-col items-center"
      >
        <div className="absolute top-4 right-4 z-20">
             <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 transition-colors">
               <X size={16} />
             </button>
        </div>

        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Hydration
        </div>

        {/* Liquid Container */}
        <div className="relative w-40 h-56 bg-[#0f172a] rounded-[32px] overflow-hidden border border-white/5 mb-6 shadow-inner">
           {/* Liquid */}
           <motion.div 
             className="absolute bottom-0 left-0 right-0 bg-[#0A84FF]"
             initial={{ height: `${visualPercentage}%` }}
             animate={{ height: `${visualPercentage}%` }}
             transition={{ type: "spring", stiffness: 100, damping: 20 }}
           >
              {/* Gloss effect */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-white/20" />
           </motion.div>
           
           {/* Percentage Text Overlay */}
           <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white drop-shadow-md">
              <Droplets size={32} className="mb-2 opacity-80" fill="currentColor" />
              <div className="text-4xl font-bold font-display">{rawPercentage}%</div>
           </div>
        </div>

        {/* Amount Text */}
        <div className="text-center mb-8">
           <div className="text-4xl font-bold font-display text-white tabular-nums">{intake}<span className="text-xl text-gray-500 ml-1">ml</span></div>
           <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Goal: {GOAL}ml</div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full mb-4">
           <button 
             onClick={() => updateIntake(250)}
             className="bg-[#0A84FF] hover:bg-[#0077ED] text-white h-12 rounded-[16px] font-bold text-sm flex items-center justify-center gap-1 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
           >
             <Plus size={16} /> 250ml
           </button>
           <button 
             onClick={() => updateIntake(500)}
             className="bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white border border-white/5 h-12 rounded-[16px] font-bold text-sm flex items-center justify-center gap-1 active:scale-95 transition-all"
           >
             <Plus size={16} /> 500ml
           </button>
        </div>

        <button 
          onClick={() => updateIntake(-250)}
          className="text-xs font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-1 py-2"
        >
           <Minus size={12} /> Remove Entry
        </button>

      </motion.div>
    </div>,
    document.body
  );
};