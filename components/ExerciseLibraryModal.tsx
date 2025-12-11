
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronRight, Filter, Plus, Edit2, Check } from 'lucide-react';
import { EXERCISE_DB, EXERCISE_CATEGORIES, Exercise } from '../data/exercises.ts';
import { ExerciseDetailModal } from './ExerciseDetailModal.tsx';
import { Button } from './ui/Button.tsx';

interface ExerciseLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (exercise: Exercise) => void;
  onMultiSelect?: (exercises: Exercise[]) => void;
  mode?: 'view' | 'select';
  multiSelect?: boolean;
}

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({ 
  isOpen, onClose, onSelect, onMultiSelect, mode = 'view', multiSelect = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredExercises = EXERCISE_DB.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.muscle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || ex.muscle === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleExerciseClick = (ex: Exercise) => {
    if (multiSelect) {
        setSelectedIds(prev => 
            prev.includes(ex.id) 
            ? prev.filter(id => id !== ex.id) 
            : [...prev, ex.id]
        );
    } else if (mode === 'select' && onSelect) {
      onSelect(ex);
      onClose();
    } else {
      setSelectedExercise(ex);
    }
  };

  const handleConfirmMultiSelect = () => {
      if (onMultiSelect) {
          const selectedExercises = EXERCISE_DB.filter(ex => selectedIds.includes(ex.id));
          onMultiSelect(selectedExercises);
          onClose();
          // Reset selection after confirming
          setSelectedIds([]);
      }
  };

  const handleCreateCustom = () => {
    // Create a mock custom exercise
    const newCustomExercise: Exercise = {
        id: `custom-${Date.now()}`,
        name: searchQuery || "Custom Exercise",
        muscle: "General",
        equipment: "None",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
        overview: "Custom exercise added by user.",
        steps: ["Perform the exercise as planned."],
        benefits: ["Custom benefit"],
        bpm: 0,
        difficulty: 'Beginner',
        videoContext: "",
        equipmentList: [],
        calories: 0
    };
    
    if (multiSelect && onMultiSelect) {
        onMultiSelect([newCustomExercise]);
        onClose();
    } else if (onSelect) {
        onSelect(newCustomExercise);
        onClose();
    } else {
        setSearchQuery('');
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed inset-0 z-[1100] bg-black flex flex-col"
        >
          {/* Header */}
          <div className="pt-[calc(env(safe-area-inset-top)+20px)] px-5 pb-4 bg-black/90 backdrop-blur-xl border-b border-white/10 z-20 sticky top-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-display text-white">
                  {mode === 'select' ? (multiSelect ? 'Select Exercises' : 'Select Exercise') : 'Exercise Library'}
              </h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center text-white border border-white/10 active:scale-95 transition-transform"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or muscle..."
                className="w-full bg-[#1C1C1E] border border-white/10 rounded-[20px] py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors font-medium text-[15px]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                 <button className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center text-gray-400">
                    <Filter size={14} />
                 </button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-5 px-5">
              {EXERCISE_CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wide border transition-all whitespace-nowrap ${
                    activeCategory === cat 
                    ? 'bg-white text-black border-white' 
                    : 'bg-[#1C1C1E] text-zinc-500 border-white/10'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-5 pb-32 bg-black">
             <div className="grid grid-cols-1 gap-3">
               {filteredExercises.map(ex => {
                 const isSelected = selectedIds.includes(ex.id);
                 return (
                    <motion.div
                        layoutId={`lib-${ex.id}`}
                        key={ex.id}
                        onClick={() => handleExerciseClick(ex)}
                        className={`p-4 rounded-[24px] border flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer group hover:bg-[#222] ${
                            isSelected ? 'bg-[#1C1C1E] border-blue-500/50 ring-1 ring-blue-500/20' : 'bg-[#1C1C1E] border-white/5'
                        }`}
                        >
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-[18px] bg-[#2C2C2E] overflow-hidden shrink-0 relative">
                                <img src={ex.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={ex.name} />
                                {isSelected && (
                                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                        <Check size={24} className="text-white drop-shadow-md" strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{ex.muscle}</div>
                                <h3 className={`text-[17px] font-bold font-display truncate leading-tight ${isSelected ? 'text-blue-400' : 'text-white'}`}>{ex.name}</h3>
                            </div>
                        </div>

                        {multiSelect ? (
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                                isSelected ? 'bg-blue-500 border-blue-500' : 'border-white/20 bg-transparent'
                            }`}>
                                {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center text-white group-hover:bg-[#0A84FF] group-hover:border-[#0A84FF] transition-all shadow-lg">
                                <Plus size={20} strokeWidth={2.5} />
                            </div>
                        )}
                    </motion.div>
                 );
               })}
             </div>

             {/* Not Found / Custom Add */}
             <div className="mt-6">
                {filteredExercises.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-zinc-500 mb-4 text-sm">No exercises found matching "{searchQuery}"</p>
                        <button 
                            onClick={handleCreateCustom}
                            className="bg-[#1C1C1E] px-6 py-3 rounded-full text-white font-bold text-sm border border-white/10 hover:bg-[#2C2C2E] transition-colors flex items-center gap-2 mx-auto"
                        >
                            <Plus size={16} /> Create "{searchQuery}"
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleCreateCustom}
                        className="w-full py-4 rounded-2xl border border-dashed border-white/10 flex items-center justify-center gap-2 text-zinc-500 hover:text-white hover:bg-white/5 transition-all group"
                    >
                        <Edit2 size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Create Custom Exercise</span>
                    </button>
                )}
             </div>
          </div>
          
          {/* Multi-Select Floating Footer */}
          {multiSelect && selectedIds.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent safe-area-bottom z-30">
                  <Button onClick={handleConfirmMultiSelect} className="w-full h-14 rounded-[20px] bg-white text-black text-lg font-bold shadow-2xl">
                      Add {selectedIds.length} Exercise{selectedIds.length > 1 ? 's' : ''}
                  </Button>
              </div>
          )}
          
          {selectedExercise && (
             <ExerciseDetailModal 
               exercise={selectedExercise} 
               onClose={() => setSelectedExercise(null)}
               onAddToWorkout={
                   mode === 'select' && onSelect && !multiSelect
                   ? () => { onSelect(selectedExercise); onClose(); } 
                   : undefined
               }
             />
          )}

        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
