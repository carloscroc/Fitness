
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, ChevronLeft, ChevronRight, Calendar, Dumbbell, Layers, Maximize2, Minimize2, Zap, Film } from 'lucide-react';
import { Exercise } from '../data/exercises.ts';
import { Button } from './ui/Button.tsx';

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
  onAddToWorkout?: (action?: 'SCHEDULE' | 'START', date?: string) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({ 
  exercise, onClose, onAddToWorkout 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(true);
  
  // Scheduling State
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Calendar Navigation State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const progressBarRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
        if (isPlaying) {
            videoRef.current.play().catch(e => console.log('Autoplay prevented', e));
        } else {
            videoRef.current.pause();
        }
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
      if (videoRef.current) {
          const curr = videoRef.current.currentTime;
          const dur = videoRef.current.duration;
          if (Number.isFinite(curr)) setCurrentTime(curr);
          if (Number.isFinite(dur) && dur > 0) {
              setDuration(dur);
              setProgress((curr / dur) * 100);
          }
      }
  };

  const handleSeek = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (progressBarRef.current && videoRef.current) {
          const rect = progressBarRef.current.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const width = rect.width;
          if (width === 0) return;
          const newPercentage = Math.max(0, Math.min(100, (clickX / width) * 100));
          const dur = videoRef.current.duration;
          if (Number.isFinite(dur)) {
             videoRef.current.currentTime = (newPercentage / 100) * dur;
             setProgress(newPercentage);
          }
      }
  };

  const togglePlay = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsPlaying(!isPlaying);
  };

  const toggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
        videoContainerRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  const formatTime = (time: number) => {
      if (isNaN(time) || !Number.isFinite(time)) return "0:00";
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleScheduleConfirm = () => {
      if (selectedDate && onAddToWorkout) {
          onAddToWorkout('SCHEDULE', selectedDate);
          setIsScheduling(false);
          onClose();
      }
  };

  // Calendar Helpers
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl pointer-events-auto" onClick={onClose} />
      
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative bg-[#000000] w-full md:w-[600px] h-[95vh] md:h-[90vh] rounded-t-[32px] md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-white/10"
      >
        {/* --- Video Player Section --- */}
        <div 
            ref={videoContainerRef}
            className="h-[55vh] relative shrink-0 bg-[#111] group overflow-hidden cursor-pointer"
            onClick={togglePlay}
        >
           {/* Video Source */}
           {exercise.video ? (
               <video 
                 ref={videoRef}
                 src={exercise.video}
                 className="w-full h-full object-cover"
                 playsInline
                 loop
                 onTimeUpdate={handleTimeUpdate}
                 onEnded={() => setIsPlaying(false)}
               />
           ) : (
               <img src={exercise.image} className="w-full h-full object-cover opacity-90" alt={exercise.name} />
           )}
           
           {/* Dynamic Overlays */}
           <motion.div 
             animate={{ opacity: isPlaying ? 0 : 1 }}
             transition={{ duration: 0.3 }}
             className="absolute inset-0 pointer-events-none bg-black/30"
           />
           <motion.div 
             animate={{ opacity: isPlaying ? 0 : 1 }}
             transition={{ duration: 0.3 }}
             className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/60 via-transparent to-black/80"
           />

           {/* Controls Layer */}
           <motion.div 
             animate={{ opacity: isPlaying ? 0 : 1 }}
             transition={{ duration: 0.2 }}
             className="absolute inset-0 flex flex-col justify-between p-6 z-20 pointer-events-none"
           >
              {/* Top Header */}
              <div className="flex justify-between items-start pointer-events-auto">
                 <button 
                   onClick={onClose}
                   className="h-10 px-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center gap-2 text-[11px] font-bold text-white uppercase tracking-wider hover:bg-white/10 transition-colors"
                 >
                    <ChevronLeft size={16} /> Back
                 </button>

                 <div className="flex gap-2">
                    <div className="h-10 px-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider">
                        {exercise.equipment?.toUpperCase() || 'BODYWEIGHT'}
                    </div>
                     <button 
                      onClick={onClose} 
                      className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <X size={18} />
                    </button>
                 </div>
              </div>

              {/* Center Play Button */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                 <motion.button 
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={togglePlay}
                   className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl group"
                 >
                    {isPlaying ? <Pause size={32} className="fill-current" /> : <Play size={32} className="fill-current ml-2 group-hover:scale-110 transition-transform" />}
                 </motion.button>
              </div>

              {/* Bottom Interface */}
              <div className="mt-auto pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                 <div className="mb-6">
                    <motion.h1 
                      layoutId={`title-${exercise.id}`}
                      className="text-4xl font-bold font-display text-white leading-[0.9] drop-shadow-xl"
                    >
                        {exercise.name}
                    </motion.h1>
                 </div>

                 {/* Custom Scrubber */}
                 <div className="flex items-center gap-4 bg-[#1C1C1E]/80 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-xl">
                     <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shrink-0">
                        {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-1" />}
                     </button>
                     
                     <div 
                        className="flex-1 h-8 flex items-center cursor-pointer relative group/scrubber"
                        ref={progressBarRef}
                        onClick={handleSeek}
                     >
                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-white rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        {/* Interactive Thumb */}
                        <div 
                           className="absolute w-3 h-3 bg-white rounded-full shadow-md top-1/2 -translate-y-1/2 opacity-0 group-hover/scrubber:opacity-100 transition-opacity pointer-events-none"
                           style={{ left: `${progress}%` }}
                        />
                     </div>

                     <div className="flex items-center gap-3 pr-2">
                         <div className="text-[10px] font-bold text-zinc-400 tabular-nums font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                         </div>
                         <button onClick={toggleFullScreen} className="text-zinc-400 hover:text-white transition-colors">
                            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                         </button>
                     </div>
                 </div>
              </div>
           </motion.div>
        </div>

        {/* --- Content Body --- */}
        <div className="flex-1 overflow-y-auto px-6 pb-32 pt-8 bg-[#000000]">
           
           {/* Equipment Tags */}
           <section className="mb-8">
               <div className="flex items-center gap-2 mb-4 text-white">
                  <Dumbbell size={16} />
                  <h3 className="text-sm font-bold font-display uppercase tracking-widest">Equipment</h3>
               </div>
               <div className="flex flex-wrap gap-2">
                   {exercise.equipmentList ? exercise.equipmentList.map((item, i) => (
                       <span key={i} className="px-4 py-2 bg-[#1C1C1E] rounded-full text-[11px] font-bold text-zinc-300 border border-white/5">
                           {item}
                       </span>
                   )) : (
                       <span className="px-4 py-2 bg-[#1C1C1E] rounded-full text-[11px] font-bold text-zinc-300 border border-white/5">
                           {exercise.equipment || 'Standard Gym Equipment'}
                       </span>
                   )}
               </div>
           </section>

           {/* Instructions */}
           <section className="mb-8">
               <div className="flex items-center justify-between mb-6 text-white">
                   <div className="flex items-center gap-2">
                       <Layers size={16} />
                       <h3 className="text-sm font-bold font-display uppercase tracking-widest">Instructions</h3>
                   </div>
                   <span className="text-[10px] font-bold text-zinc-500 uppercase">{exercise.steps?.length || 0} Steps</span>
               </div>
               
               <div className="relative pl-2.5">
                   <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-[#1C1C1E]" />
                   <div className="space-y-6">
                       {exercise.steps && exercise.steps.length > 0 ? exercise.steps.map((step, i) => (
                           <div key={i} className="relative flex gap-5 group">
                               <div className="w-8 h-8 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[11px] font-bold text-zinc-400 group-hover:text-white group-hover:bg-[#2C2C2E] transition-colors shrink-0 z-10">
                                   {i + 1}
                               </div>
                               <p className="text-[14px] text-zinc-400 leading-relaxed pt-1 group-hover:text-zinc-200 transition-colors">
                                   {step}
                                </p>
                           </div>
                       )) : (
                         <p className="text-zinc-500 text-sm italic pl-8">Standard form applies.</p>
                       )}
                   </div>
               </div>
           </section>

           {/* Coach Tips Card */}
           <section className="mb-6 bg-[#1C1C1E] border border-white/5 rounded-[24px] p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 text-[#0A84FF]">
                        <Zap size={14} fill="currentColor" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Coach Tips</span>
                    </div>
                    <p className="text-[15px] text-white font-medium italic leading-relaxed">
                        "{exercise.videoContext || "Focus on maintaining a neutral spine and controlled breathing throughout the movement."}"
                    </p>
                </div>
           </section>
        </div>

        {/* --- Sticky Footer Actions --- */}
        {onAddToWorkout && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent pt-12 safe-area-bottom z-30">
                <AnimatePresence mode="wait">
                    {showAddOptions && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3"
                        >
                            <Button 
                                variant="secondary" 
                                onClick={() => setIsScheduling(true)} 
                                className="flex-1 h-14 rounded-[20px] text-[15px] font-bold bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 text-white hover:bg-[#2C2C2E]"
                            >
                                <Calendar size={18} className="mr-2" /> Schedule
                            </Button>
                            <Button 
                                onClick={() => onAddToWorkout('START')} 
                                className="flex-1 bg-white text-black hover:bg-zinc-200 h-14 rounded-[20px] text-[15px] font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                <Play size={18} className="mr-2 fill-current" /> Start Now
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )}

        {/* --- Schedule Date Picker Overlay --- */}
        <AnimatePresence>
            {isScheduling && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="absolute inset-0 z-50 bg-[#09090b] flex flex-col pt-safe-top"
                >
                    <div className="px-6 py-5 flex items-center justify-between border-b border-white/10 shrink-0">
                        <h2 className="text-xl font-bold font-display text-white">Select Date</h2>
                        <button onClick={() => setIsScheduling(false)} className="w-9 h-9 rounded-full bg-[#1C1C1E] flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-white/5">
                            <X size={18} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                        <div className="w-full max-w-sm">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-8">
                               <button onClick={handlePrevMonth} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1C1C1E] text-white hover:bg-[#2C2C2E] border border-white/5 transition-colors">
                                  <ChevronLeft size={18} />
                               </button>
                               <span className="text-base font-bold font-display text-white uppercase tracking-wider">
                                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                               </span>
                               <button onClick={handleNextMonth} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1C1C1E] text-white hover:bg-[#2C2C2E] border border-white/5 transition-colors">
                                  <ChevronRight size={18} />
                               </button>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 mb-4">
                               {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                  <div key={d} className="text-center text-[10px] font-bold text-zinc-600 uppercase py-2">{d}</div>
                               ))}
                            </div>

                            <div className="grid grid-cols-7 gap-y-3 gap-x-1">
                               {Array(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()).fill(null).map((_, i) => <div key={`blank-${i}`} />)}
                               {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(d => {
                                  const year = currentMonth.getFullYear();
                                  const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
                                  const day = String(d).padStart(2, '0');
                                  const fullDate = `${year}-${month}-${day}`;
                                  const isSelected = selectedDate === fullDate;
                                  const isToday = fullDate === new Date().toISOString().split('T')[0];

                                  return (
                                     <button
                                        key={d}
                                        onClick={() => setSelectedDate(fullDate)}
                                        className={`aspect-square rounded-full flex flex-col items-center justify-center text-[13px] font-bold transition-all relative ${
                                           isSelected 
                                           ? 'bg-[#0A84FF] text-white shadow-[0_0_15px_rgba(10,132,255,0.4)] scale-105 z-10' 
                                           : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                        }`}
                                     >
                                        {d}
                                        {isToday && !isSelected && <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#0A84FF]" />}
                                     </button>
                                  );
                               })}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 safe-area-bottom bg-black">
                        <Button 
                            disabled={!selectedDate} 
                            onClick={handleScheduleConfirm}
                            className="w-full bg-white text-black hover:bg-zinc-200 h-14 rounded-[20px] text-lg font-bold disabled:opacity-50 border-none"
                        >
                            Add to Workout
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </motion.div>
    </motion.div>,
    document.body
  );
};
