
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Plus, Calendar, RefreshCw, Clock, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button.tsx';
import { AppView } from '../types.ts';

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onManualLog: () => void;
  onNavigate: (view: AppView, params?: any) => void;
}

type WorkoutState = 'SCHEDULED' | 'EMPTY';

export const ActionSheet: React.FC<ActionSheetProps> = ({ 
  isOpen, 
  onClose, 
  onManualLog,
  onNavigate 
}) => {
  const [workoutState, setWorkoutState] = useState<WorkoutState>('SCHEDULED');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000]"
          />

          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[1001] flex justify-center pointer-events-none md:items-center md:inset-0"
          >
            <div className="bg-[#000000] w-full md:w-[480px] md:rounded-3xl rounded-t-[32px] overflow-hidden shadow-2xl pointer-events-auto ring-1 ring-white/10 max-h-[90vh] flex flex-col safe-area-bottom pb-6">
              
              {/* Header */}
              <div className="px-6 py-5 flex justify-between items-center bg-[#000000] shrink-0 border-b border-white/5">
                <h3 className="text-[24px] font-bold font-display text-white tracking-tight">Today's Activity</h3>
                <button 
                  onClick={onClose} 
                  className="w-8 h-8 flex items-center justify-center bg-[#1C1C1E] rounded-full text-zinc-400 hover:bg-white/10 hover:text-white transition-colors border border-white/5"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 pb-2 pt-5 space-y-5 bg-[#000000] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {workoutState === 'SCHEDULED' ? (
                    <motion.div 
                      key="scheduled"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-[#1C1C1E] border border-white/5 p-6 rounded-[32px] relative overflow-hidden group shadow-lg"
                    >
                      {/* Background Decor */}
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none" />
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-5">
                          {/* Scheduled Badge */}
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                             <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse" />
                             <span className="text-[10px] font-bold text-white uppercase tracking-wider">Scheduled</span>
                          </div>
                          
                          {/* Time Badge */}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2C2C2E] border border-white/5">
                             <Clock size={12} className="text-zinc-400" />
                             <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">45 Min</span>
                          </div>
                        </div>
                        
                        <h2 className="text-[36px] font-bold font-display text-white mb-2 leading-[0.95] tracking-tight">
                           Upper Body<br/>Strength
                        </h2>
                        
                        <div className="flex items-center gap-2 mb-8">
                           <span className="text-[13px] font-medium text-zinc-400">Hypertrophy Program</span>
                           <span className="w-1 h-1 rounded-full bg-zinc-600" />
                           <span className="text-[13px] font-medium text-zinc-400">Week 4, Day 2</span>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button 
                            variant="primary"
                            onClick={() => { onManualLog(); onClose(); }} 
                            className="flex-[2] h-14 rounded-[20px] text-[15px] font-bold border-none shadow-[0_0_20px_rgba(255,255,255,0.15)] !bg-white !text-black hover:!bg-zinc-200"
                          >
                            <Play size={20} className="mr-2 fill-current" /> Start Session
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={() => { onNavigate(AppView.COACH, { tab: 'Library' }); onClose(); }} 
                            className="flex-1 h-14 rounded-[20px] text-[15px] font-bold bg-[#2C2C2E] text-white border border-white/5 hover:bg-[#333]"
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      className="bg-[#1C1C1E] border border-dashed border-white/10 p-8 rounded-[32px] flex flex-col items-center justify-center text-center py-12"
                    >
                      <div className="w-14 h-14 bg-[#2C2C2E] rounded-full flex items-center justify-center shadow-sm mb-4 text-zinc-500">
                        <Calendar size={24} strokeWidth={1.5} />
                      </div>
                      <h2 className="text-lg font-bold text-white mb-1">Rest Day</h2>
                      <p className="text-zinc-500 text-sm mb-6 max-w-[200px]">No workout scheduled today.</p>
                      
                      <button onClick={() => setWorkoutState('SCHEDULED')} className="text-xs font-bold text-white flex items-center gap-1 hover:text-zinc-300 transition-colors uppercase tracking-wider">
                         <RefreshCw size={12} /> Load Schedule
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-4">
                   <div className="flex items-center gap-4 py-2">
                      <div className="h-px bg-[#2C2C2E] flex-1" />
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Or</span>
                      <div className="h-px bg-[#2C2C2E] flex-1" />
                   </div>
                   
                   <button 
                     onClick={() => { onManualLog(); onClose(); }}
                     className="w-full bg-[#1C1C1E] border border-white/5 p-5 rounded-[28px] flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-[#222]"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg">
                            <Plus size={24} strokeWidth={2.5} />
                         </div>
                         <div className="text-left">
                            <div className="text-white font-bold font-display text-[17px] leading-tight mb-0.5">Log Manually</div>
                            <div className="text-zinc-500 text-xs font-medium">Record a custom session</div>
                         </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                         <ArrowRight size={18} />
                      </div>
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
