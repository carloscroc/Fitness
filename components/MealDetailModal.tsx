
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Flame, Check, Leaf, Zap, Circle, ChevronDown } from 'lucide-react';
import { Button } from './ui/Button.tsx';
import { Meal } from '../types.ts';

interface MealDetailModalProps {
  meal: Meal;
  onClose: () => void;
  onToggleComplete?: () => void;
  onAddToPlan?: () => void;
  isLibraryItem?: boolean;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({ 
  meal, onClose, onToggleComplete, onAddToPlan, isLibraryItem 
}) => {
  
  // Interactive ingredients state
  const [ingredients, setIngredients] = useState([
    { name: 'Main Protein Source', amount: '150g', checked: false },
    { name: 'Fresh Vegetables', amount: '1 cup', checked: false },
    { name: 'Healthy Fats (Oil/Nuts)', amount: '1 tbsp', checked: false },
    { name: 'Complex Carbs', amount: '100g', checked: false },
    { name: 'Spices & Herbs', amount: 'To taste', checked: false },
  ]);

  const toggleIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index].checked = !newIngredients[index].checked;
    setIngredients(newIngredients);
  };

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1300] flex items-end md:items-center justify-center pointer-events-none"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md pointer-events-auto" onClick={onClose} />
      
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="pointer-events-auto bg-[#101010] w-full md:w-[500px] h-[95vh] md:h-[90vh] rounded-t-[32px] md:rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col border border-white/10"
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10"
        >
           <X size={20} />
        </button>

        {/* Hero Image Section */}
        <div className="relative h-[40vh] shrink-0 w-full overflow-hidden">
           <img src={meal.image} className="w-full h-full object-cover scale-105" alt={meal.title} />
           
           {/* Gradient Overlays */}
           <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/20 to-transparent" />
           <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-80" />
           
           <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                     {meal.type}
                  </span>
                  {meal.tags?.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-[#0A84FF]/20 backdrop-blur-md border border-[#0A84FF]/30 text-[10px] font-bold text-[#0A84FF] uppercase tracking-wider">
                          {tag}
                      </span>
                  ))}
              </div>
              
              {/* Title */}
              <h2 className="text-4xl font-bold font-display text-white leading-[0.95] shadow-lg drop-shadow-md">
                  {meal.title}
              </h2>
           </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto bg-[#101010] relative -mt-4 rounded-t-[32px]">
           <div className="px-8 pt-8 pb-32">
             
             {/* Ingredients Checklist */}
             <div className="mb-10">
                <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                   <Leaf size={16} className="text-zinc-400" /> Ingredients
                </h3>
                <div className="space-y-0 divide-y divide-white/5">
                   {ingredients.map((ing, i) => (
                      <div 
                          key={i} 
                          onClick={() => toggleIngredient(i)}
                          className="flex justify-between items-center py-4 group cursor-pointer active:opacity-70 transition-opacity"
                      >
                         <div className="flex items-center gap-4">
                             {/* Custom Checkbox */}
                             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${ing.checked ? 'bg-[#30D158] border-[#30D158]' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
                                 {ing.checked && <Check size={12} className="text-black" strokeWidth={3} />}
                             </div>
                             <span className={`text-[15px] font-medium transition-colors ${ing.checked ? 'text-zinc-500 line-through' : 'text-zinc-200 group-hover:text-white'}`}>
                                 {ing.name}
                             </span>
                         </div>
                         <span className={`text-xs font-bold transition-colors ${ing.checked ? 'text-zinc-600' : 'text-zinc-500'}`}>
                             {ing.amount}
                         </span>
                      </div>
                   ))}
                </div>
             </div>

             {/* Stats Row */}
             <div className="flex gap-6 mb-8 border-t border-white/10 pt-8">
                <div className="flex flex-col">
                   <div className="flex items-end gap-1.5 mb-1">
                      <span className="text-2xl font-bold text-white font-display tabular-nums leading-none">{meal.macros.p}g</span>
                   </div>
                   <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">PROT</span>
                </div>
                <div className="w-px bg-white/10 h-10 self-center" />
                <div className="flex flex-col">
                   <div className="flex items-end gap-1.5 mb-1">
                      <span className="text-2xl font-bold text-white font-display tabular-nums leading-none">{meal.macros.c}g</span>
                   </div>
                   <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">CARB</span>
                </div>
                <div className="w-px bg-white/10 h-10 self-center" />
                <div className="flex flex-col">
                   <div className="flex items-end gap-1.5 mb-1">
                      <span className="text-2xl font-bold text-white font-display tabular-nums leading-none">{meal.macros.f}g</span>
                   </div>
                   <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">FAT</span>
                </div>
                <div className="ml-auto flex flex-col items-end justify-center">
                   <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                      <Flame size={14} className="text-orange-500 fill-current" />
                      <span className="text-lg font-bold text-white font-display tabular-nums leading-none">{meal.calories}</span>
                   </div>
                </div>
             </div>

             {/* Coach Note Highlight */}
             {meal.coachNote && (
               <div className="mb-4 p-5 rounded-2xl bg-blue-900/10 border border-blue-500/20 relative overflow-hidden">
                  <div className="flex items-start gap-3 relative z-10">
                      <Zap size={16} className="text-[#0A84FF] fill-current shrink-0 mt-0.5" />
                      <div>
                          <h3 className="text-[10px] font-bold text-[#0A84FF] uppercase tracking-widest mb-1">Coach Note</h3>
                          <p className="text-[14px] text-zinc-200 leading-relaxed font-medium italic">
                              "{meal.coachNote}"
                          </p>
                      </div>
                  </div>
               </div>
             )}
           </div>
        </div>

        {/* Floating Action Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-[#101010] via-[#101010] to-transparent safe-area-bottom z-20">
           {isLibraryItem ? (
              <Button onClick={() => { onAddToPlan?.(); onClose(); }} className="w-full bg-white text-black hover:bg-zinc-200 h-14 rounded-[20px] text-lg font-bold shadow-lg shadow-white/5">
                 Add to Plan
              </Button>
           ) : (
              <Button 
                onClick={() => { onToggleComplete?.(); onClose(); }} 
                className={`w-full h-14 rounded-[20px] text-lg font-bold transition-all shadow-lg ${
                    meal.completed 
                    ? 'bg-[#1C1C30] text-zinc-400 border border-white/5' 
                    : 'bg-[#183920] text-[#4ade80] border border-[#4ade80]/20 hover:bg-[#1f4a29]'
                }`}
              >
                 {meal.completed ? (
                    <span className="flex items-center gap-2"><Check size={20} strokeWidth={3} /> Meal Logged</span>
                 ) : (
                    <span className="flex items-center gap-2"><Check size={20} strokeWidth={3} /> Meal Logged</span>
                 )}
              </Button>
           )}
        </div>

      </motion.div>
    </motion.div>,
    document.body
  );
};
