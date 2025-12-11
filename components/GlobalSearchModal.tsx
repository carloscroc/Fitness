
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Search, Dumbbell, Utensils, User, ChevronRight, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  onClose: () => void;
  onNavigate: (view: any, params?: any) => void;
}

const CATEGORIES = ['All', 'Workouts', 'Nutrition', 'People'];

const MOCK_RESULTS = {
  workouts: [
    { title: 'Upper Body Strength', subtitle: 'Hypertrophy • 65 min', type: 'workout' },
    { title: 'HIIT Cardio Blast', subtitle: 'Endurance • 30 min', type: 'workout' },
  ],
  nutrition: [
    { title: 'High Protein Oats', subtitle: 'Breakfast • 420 kcal', type: 'nutrition' },
    { title: 'Grilled Chicken Salad', subtitle: 'Lunch • 350 kcal', type: 'nutrition' },
  ],
  people: [
    { title: 'Sarah Jenkins', subtitle: 'HIIT Coach', type: 'user' },
    { title: 'Mike Ross', subtitle: 'Member', type: 'user' },
  ]
};

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1200] bg-black/95 backdrop-blur-xl flex flex-col"
    >
      {/* Header */}
      <div className="pt-[calc(env(safe-area-inset-top)+20px)] px-5 pb-4 border-b border-white/10 flex items-center gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              autoFocus
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search NeoFit..."
              className="w-full bg-[#1C1C1E] border border-white/10 rounded-[20px] py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors font-medium text-lg"
            />
         </div>
         <button 
           onClick={onClose}
           className="text-sm font-bold text-zinc-400 hover:text-white transition-colors"
         >
           Cancel
         </button>
      </div>

      {/* Categories */}
      <div className="px-5 py-4 flex gap-2 overflow-x-auto no-scrollbar">
         {CATEGORIES.map(cat => (
           <button
             key={cat}
             onClick={() => setActiveCat(cat)}
             className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all whitespace-nowrap ${
               activeCat === cat 
               ? 'bg-white text-black border-white' 
               : 'bg-[#1C1C1E] text-zinc-500 border-white/10 hover:text-white'
             }`}
           >
             {cat}
           </button>
         ))}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-5 pb-10">
         {!query ? (
           <div className="pt-10">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Recent Searches</h3>
              <div className="space-y-4">
                 {['Leg Workout', 'Keto Recipes', 'Coach J'].map((item, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-pointer" onClick={() => setQuery(item)}>
                      <div className="flex items-center gap-3 text-zinc-400 group-hover:text-white transition-colors">
                         <ClockIcon size={16} />
                         <span className="text-base font-medium">{item}</span>
                      </div>
                      <ChevronRight size={16} className="text-zinc-600" />
                   </div>
                 ))}
              </div>
           </div>
         ) : (
           <div className="space-y-6 pt-2">
              {(activeCat === 'All' || activeCat === 'Workouts') && (
                <div>
                   <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Workouts</h3>
                   <div className="space-y-2">
                      {MOCK_RESULTS.workouts.map((item, i) => (
                        <ResultRow key={i} icon={Dumbbell} title={item.title} subtitle={item.subtitle} />
                      ))}
                   </div>
                </div>
              )}

              {(activeCat === 'All' || activeCat === 'Nutrition') && (
                <div>
                   <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Nutrition</h3>
                   <div className="space-y-2">
                      {MOCK_RESULTS.nutrition.map((item, i) => (
                        <ResultRow key={i} icon={Utensils} title={item.title} subtitle={item.subtitle} />
                      ))}
                   </div>
                </div>
              )}

              {(activeCat === 'All' || activeCat === 'People') && (
                <div>
                   <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">People</h3>
                   <div className="space-y-2">
                      {MOCK_RESULTS.people.map((item, i) => (
                        <ResultRow key={i} icon={User} title={item.title} subtitle={item.subtitle} />
                      ))}
                   </div>
                </div>
              )}
           </div>
         )}
      </div>
    </motion.div>,
    document.body
  );
};

const ResultRow = ({ icon: Icon, title, subtitle }: any) => (
  <div className="flex items-center gap-4 p-4 bg-[#1C1C1E] rounded-[24px] border border-white/5 active:bg-[#2C2C2E] transition-colors cursor-pointer group">
     <div className="w-10 h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center text-zinc-400 border border-white/5 group-hover:text-white group-hover:border-white/20 transition-colors">
        <Icon size={18} />
     </div>
     <div className="flex-1">
        <div className="text-white font-bold text-sm mb-0.5">{title}</div>
        <div className="text-zinc-500 text-xs font-medium">{subtitle}</div>
     </div>
     <div className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 group-hover:text-white transition-colors">
        <ArrowRight size={16} />
     </div>
  </div>
);

const ClockIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
