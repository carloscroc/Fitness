
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion';
import { ChevronDown, Trash2, Check, Plus, Clock, Zap, Dumbbell, ChevronRight, Calculator, ChevronLeft, Play, Maximize2, MoreHorizontal, List, Grid, Info, Minimize2, Pause } from 'lucide-react';
import { ExerciseLibraryModal } from '../components/ExerciseLibraryModal.tsx';
import { EXERCISE_DB, Exercise } from '../data/exercises.ts';
import { TimerModal } from '../components/TimerModal.tsx';
import { WorkoutDay } from '../types.ts';

interface LogWorkoutProps {
  onClose: () => void;
  initialWorkout?: WorkoutDay | null;
}

// --- Slide to Finish Component ---
const SlideToFinish = ({ onFinish }: { onFinish: () => void }) => {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const maxDrag = 280;
  
  const handleDragEnd = async () => {
    if (x.get() > maxDrag * 0.7) {
      await controls.start({ x: maxDrag, transition: { duration: 0.2 } });
      onFinish();
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } });
    }
  };

  return (
    <div className="relative w-full h-[72px] bg-[#1C1C1E] rounded-full overflow-hidden border border-white/10 shadow-lg group">
      <motion.div 
        style={{ opacity: useTransform(x, [0, maxDrag * 0.5], [1, 0]) }}
        className="absolute inset-0 flex items-center justify-center text-zinc-500 font-bold text-sm uppercase tracking-[0.15em] pointer-events-none group-hover:text-zinc-400 transition-colors"
      >
        Slide to Finish
      </motion.div>
      
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-[#0A84FF]/20 to-transparent" 
        style={{ opacity: useTransform(x, [0, maxDrag], [0, 1]) }}
      />

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className="absolute top-1.5 left-1.5 bottom-1.5 w-[64px] bg-zinc-300 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.3)] flex items-center justify-center cursor-grab active:cursor-grabbing z-10 hover:bg-white transition-colors"
      >
         <ChevronRight size={28} className="text-black ml-0.5" strokeWidth={3} />
      </motion.div>
    </div>
  );
};

export const LogWorkout: React.FC<LogWorkoutProps> = ({ onClose, initialWorkout }) => {
  // Modes: 'PLAYER' (Guided) or 'LIST' (Overview/Tracking)
  const [viewMode, setViewMode] = useState<'PLAYER' | 'LIST'>(initialWorkout ? 'PLAYER' : 'LIST');
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // Controls video zoom/play state
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize state lazily
  const [exercises, setExercises] = useState<any[]>(() => {
    if (initialWorkout && initialWorkout.exercises && initialWorkout.exercises.length > 0) {
        return initialWorkout.exercises.map(ex => {
            // Enrich with DB data for images, instructions, etc.
            const dbMatch = EXERCISE_DB.find(e => e.name === ex.name);
            return {
                id: Math.random().toString(36).substr(2, 9),
                name: ex.name,
                image: dbMatch?.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
                video: dbMatch?.video, // Ensure video is mapped
                muscle: dbMatch?.muscle || 'General',
                overview: dbMatch?.overview || 'No overview available.',
                steps: dbMatch?.steps || ['Follow general form cues.'],
                tips: dbMatch?.videoContext || '',
                sets: Array.from({ length: ex.sets || 3 }).map((_, i) => ({
                    id: Math.random().toString(36).substr(2, 9) + i,
                    weight: ex.lastWeight ? ex.lastWeight.replace(/[^0-9.]/g, '') : '',
                    reps: ex.reps || '',
                    completed: false,
                    type: 'working'
                }))
            };
        });
    }
    return [];
  });

  const [workoutName, setWorkoutName] = useState(() => {
      if (initialWorkout) return initialWorkout.title;
      const hour = new Date().getHours();
      if (hour < 5) return 'Late Night Session';
      if (hour < 12) return 'Morning Workout';
      if (hour < 17) return 'Afternoon Session';
      return 'Evening Workout';
  });

  const [isLibraryOpen, setIsLibraryOpen] = useState(!initialWorkout);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [smartWarmupEnabled, setSmartWarmupEnabled] = useState(false);

  // Play/Pause Effect
  useEffect(() => {
    if (videoRef.current) {
        if (isPlaying) {
            videoRef.current.play().catch(e => console.log('Autoplay prevented', e));
        } else {
            videoRef.current.pause();
        }
    }
  }, [isPlaying, activeExerciseIndex]); // Also reset on exercise change if needed

  // Fallback Sync
  useEffect(() => {
    if (initialWorkout && exercises.length === 0 && initialWorkout.exercises.length > 0) {
        setWorkoutName(initialWorkout.title);
        setViewMode('PLAYER'); 
        
        const mappedExercises = initialWorkout.exercises.map(ex => {
            const dbMatch = EXERCISE_DB.find(e => e.name === ex.name);
            return {
                id: Math.random().toString(36).substr(2, 9),
                name: ex.name,
                image: dbMatch?.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
                video: dbMatch?.video,
                muscle: dbMatch?.muscle || 'General',
                overview: dbMatch?.overview || 'No overview available.',
                steps: dbMatch?.steps || ['Follow general form cues.'],
                tips: dbMatch?.videoContext || '',
                sets: Array.from({ length: ex.sets || 3 }).map((_, i) => ({
                    id: Math.random().toString(36).substr(2, 9) + i,
                    weight: ex.lastWeight ? ex.lastWeight.replace(/[^0-9.]/g, '') : '',
                    reps: ex.reps || '',
                    completed: false,
                    type: 'working'
                }))
            };
        });
        setExercises(mappedExercises);
        setIsLibraryOpen(false);
    }
  }, [initialWorkout]);

  const addExercise = (exercise: Exercise) => {
    const newExercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: exercise.name,
      image: exercise.image,
      video: exercise.video,
      muscle: exercise.muscle,
      overview: exercise.overview,
      steps: exercise.steps,
      tips: exercise.videoContext,
      sets: [{ id: Math.random().toString(36), weight: '', reps: '', completed: false, type: 'working' }]
    };
    setExercises([...exercises, newExercise]);
    setIsLibraryOpen(false);
    if (exercises.length === 0) setViewMode('PLAYER');
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const prevSet = ex.sets[ex.sets.length - 1];
        return { 
          ...ex, 
          sets: [...ex.sets, { 
            id: Math.random().toString(36), 
            weight: prevSet ? prevSet.weight : '', 
            reps: prevSet ? prevSet.reps : '', 
            completed: false,
            type: 'working' 
          }] 
        };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: string, value: any) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: ex.sets.map((s: any) => s.id === setId ? { ...s, [field]: value } : s) };
      }
      return ex;
    }));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
    if (activeExerciseIndex >= exercises.length - 1) {
        setActiveExerciseIndex(Math.max(0, exercises.length - 2));
    }
  };

  const toggleSmartWarmup = () => {
    setSmartWarmupEnabled(!smartWarmupEnabled);
  };

  const currentExercise = exercises[activeExerciseIndex];

  // --- Render Guided Player ---
  const renderPlayer = () => {
      if (!currentExercise) return null;

      return (
        <div className="flex flex-col h-full bg-black relative">
            {/* Header / Top Bar - Overlay on video */}
            <motion.div 
                animate={{ opacity: isPlaying ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className="absolute top-0 left-0 right-0 z-40 p-4 pt-safe-top flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none"
            >
                <div className="pointer-events-auto flex items-center gap-3">
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-colors">
                        <ChevronDown size={20} />
                    </button>
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0A84FF] animate-pulse"></div>
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">{activeExerciseIndex + 1} / {exercises.length}</span>
                        </div>
                    </div>
                </div>
                <div className="pointer-events-auto flex gap-2">
                    <button onClick={() => setViewMode('LIST')} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-colors relative">
                        <List size={20} />
                        {/* Dot to indicate this is the tracker */}
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#0A84FF] rounded-full" />
                    </button>
                    <button onClick={() => setIsTimerOpen(true)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-colors">
                        <Clock size={20} />
                    </button>
                </div>
            </motion.div>

            {/* Video / Visual Area */}
            <motion.div 
                className="relative w-full shrink-0 overflow-hidden cursor-pointer bg-[#111] z-0"
                initial={false}
                animate={{ height: isPlaying ? '100%' : '45vh' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={() => setIsPlaying(!isPlaying)}
            >
                {currentExercise.video ? (
                    <motion.video 
                        ref={videoRef}
                        key={currentExercise.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, scale: isPlaying ? 1.05 : 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        src={currentExercise.video}
                        className="w-full h-full object-cover"
                        loop
                        muted
                        playsInline
                    />
                ) : (
                    <motion.img 
                        key={currentExercise.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, scale: isPlaying ? 1.1 : 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        src={currentExercise.image} 
                        className="w-full h-full object-cover"
                    />
                )}
                
                {/* Overlays - Hide when playing for immersion */}
                <motion.div 
                    animate={{ opacity: isPlaying ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 pointer-events-none"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl group">
                            {isPlaying ? (
                                <Pause size={32} className="fill-white text-white" />
                            ) : (
                                <Play size={32} className="fill-white text-white ml-2 group-hover:scale-110 transition-transform" />
                            )}
                        </div>
                    </div>

                    {/* Exercise Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 pt-12">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={`badge-${currentExercise.id}`}
                            className="flex items-center gap-2 mb-2"
                        >
                            <span className="px-2.5 py-1 rounded-full bg-[#0A84FF] text-[9px] font-bold text-white uppercase tracking-wider">
                                Set {currentExercise.sets.filter((s:any) => s.completed).length + 1}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{currentExercise.muscle}</span>
                        </motion.div>
                        <motion.h2 
                            key={`title-${currentExercise.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-bold font-display text-white leading-tight drop-shadow-lg"
                        >
                            {currentExercise.name}
                        </motion.h2>
                    </div>
                </motion.div>

                {/* Minimize Button (Only when playing) */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isPlaying ? 1 : 0 }}
                    className="absolute top-4 right-4 z-50 pointer-events-auto pt-safe-top"
                >
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsPlaying(false); }}
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <Minimize2 size={20} />
                    </button>
                </motion.div>
            </motion.div>

            {/* Instructions & Guidance Area */}
            <motion.div 
                className="flex-1 bg-black overflow-y-auto px-6 pt-6 pb-32"
                animate={{ opacity: isPlaying ? 0 : 1 }}
                transition={{ duration: 0.3 }}
            >
                
                {/* Coach Tips - Specific Design Match */}
                {currentExercise.tips && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-5 rounded-2xl bg-[#0B1221] border border-[#1e293b] relative overflow-hidden"
                    >
                        <div className="absolute top-4 right-4 text-[#0A84FF]">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <h4 className="text-[#0A84FF] text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                            Coach Tip
                        </h4>
                        <p className="text-[15px] text-zinc-200 leading-relaxed font-medium">
                            "{currentExercise.tips}"
                        </p>
                    </motion.div>
                )}

                {/* Overview */}
                <div className="mb-8">
                    <h3 className="text-white font-bold text-base mb-2 font-display">Overview</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        {currentExercise.overview}
                    </p>
                </div>

                {/* Steps */}
                <div>
                    <h3 className="text-white font-bold text-base mb-4 font-display">Instructions</h3>
                    <div className="space-y-6 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-zinc-800" />
                        
                        {currentExercise.steps && currentExercise.steps.map((step: string, i: number) => (
                            <div key={i} className="flex gap-4 group relative z-10">
                                <div className="w-6 h-6 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-400 group-hover:text-white group-hover:bg-[#0A84FF] group-hover:border-[#0A84FF] transition-colors shrink-0 mt-0.5">
                                    {i + 1}
                                </div>
                                <p className="text-zinc-300 text-sm leading-relaxed group-hover:text-white transition-colors">
                                    {step}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Footer Navigation - Always visible unless playing */}
            <motion.div 
                className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent pt-12 safe-area-bottom z-40"
                animate={{ y: isPlaying ? 100 : 0, opacity: isPlaying ? 0 : 1 }}
                transition={{ duration: 0.3 }}
            >
                <button 
                    onClick={() => {
                        setIsPlaying(false); // Stop video before transition
                        if (activeExerciseIndex < exercises.length - 1) {
                            setActiveExerciseIndex(i => i + 1);
                        } else {
                            onClose();
                        }
                    }}
                    className="w-full bg-white text-black h-14 rounded-[20px] font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-zinc-200 active:scale-[0.98] transition-all"
                >
                    {activeExerciseIndex < exercises.length - 1 ? 'Next Exercise' : 'Finish Workout'} <ChevronRight size={20} />
                </button>
            </motion.div>
        </div>
      );
  };

  return createPortal(
    <motion.div 
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 200 }}
      className="fixed inset-0 z-[1000] bg-black flex flex-col md:pl-72"
    >
      <AnimatePresence mode="wait">
          {viewMode === 'PLAYER' && exercises.length > 0 ? (
              <motion.div key="player" className="h-full w-full" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  {renderPlayer()}
              </motion.div>
          ) : (
              <motion.div key="list" className="h-full w-full flex flex-col" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  {/* List Mode Header */}
                  <div className="px-6 pt-14 pb-6 bg-black flex justify-between items-start z-30 sticky top-0">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0A84FF]"></div>
                            <span className="text-[10px] font-bold text-[#0A84FF] uppercase tracking-widest">Tracker</span>
                        </div>
                        <input 
                            type="text" 
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                            className="bg-transparent text-3xl font-bold font-display text-white outline-none w-full placeholder-zinc-700 tracking-tight leading-tight p-0"
                        />
                    </div>
                    <div className="flex gap-2">
                        {exercises.length > 0 && (
                            <button onClick={() => setViewMode('PLAYER')} className="w-10 h-10 flex items-center justify-center bg-[#1C1C1E] rounded-full text-zinc-400 hover:text-white transition-colors border border-white/10 active:scale-95">
                                <Play size={20} className="ml-0.5 fill-current" />
                            </button>
                        )}
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-[#1C1C1E] rounded-full text-zinc-400 hover:text-white transition-colors border border-white/10 active:scale-95">
                            <ChevronDown size={22} />
                        </button>
                    </div>
                  </div>

                  {/* Pills */}
                  <div className="px-6 pb-8 flex gap-3 overflow-x-auto no-scrollbar shrink-0 bg-black z-20">
                    <button 
                        onClick={() => setIsTimerOpen(true)} 
                        className="h-9 px-4 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center gap-2 text-[11px] font-bold text-zinc-300 hover:bg-[#2C2C2E] hover:text-white transition-colors whitespace-nowrap active:scale-95"
                    >
                        <Clock size={12} className="text-[#0A84FF]" /> Rest Timer
                    </button>
                    <button 
                        onClick={toggleSmartWarmup} 
                        className={`h-9 px-4 rounded-full border flex items-center gap-2 text-[11px] font-bold transition-all whitespace-nowrap active:scale-95 ${
                        smartWarmupEnabled 
                            ? 'bg-[#0A84FF]/10 border-[#0A84FF]/30 text-[#0A84FF]' 
                            : 'bg-[#1C1C1E] border-white/10 text-zinc-300 hover:bg-[#2C2C2E] hover:text-white'
                        }`}
                    >
                        <Zap size={12} className={smartWarmupEnabled ? "text-[#0A84FF] fill-current" : "text-zinc-500"} /> Smart Warmup
                    </button>
                  </div>

                  {/* List Content */}
                  <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-40">
                    <AnimatePresence mode='popLayout'>
                        {exercises.map((ex, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={ex.id} 
                                className="bg-[#1C1C1E] rounded-[24px] overflow-hidden p-5 border border-white/5 relative"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-[#2C2C2E] flex items-center justify-center text-[10px] font-bold text-zinc-500 border border-white/5">
                                            {idx + 1}
                                        </div>
                                        <h3 className="text-[18px] font-bold font-display text-white tracking-tight">{ex.name}</h3>
                                    </div>
                                    <button 
                                        onClick={() => removeExercise(ex.id)}
                                        className="text-zinc-600 hover:text-red-500 transition-colors p-2 -mr-2"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-[32px_1fr_1fr_32px] gap-4 text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-3 px-1">
                                    <div className="text-center self-center">Set</div>
                                    <div className="text-center self-center">Lbs</div>
                                    <div className="text-center self-center">Reps</div>
                                    <div className="text-center self-center"></div>
                                </div>

                                <div className="space-y-2">
                                    {ex.sets.map((set: any, i: number) => (
                                        <div key={set.id} className="grid grid-cols-[32px_1fr_1fr_32px] gap-4 items-center">
                                            <div className="flex justify-center">
                                                <span className="text-[13px] font-bold font-mono text-zinc-500">{i + 1}</span>
                                            </div>
                                            <div className="h-10">
                                                <input 
                                                    type="tel" 
                                                    placeholder="-" 
                                                    value={set.weight} 
                                                    onChange={(e) => updateSet(ex.id, set.id, 'weight', e.target.value)} 
                                                    className="w-full h-full bg-black rounded-lg text-center text-white font-bold text-sm outline-none focus:ring-1 focus:ring-[#0A84FF] transition-all placeholder-zinc-800" 
                                                />
                                            </div>
                                            <div className="h-10">
                                                <input 
                                                    type="tel" 
                                                    placeholder="-" 
                                                    value={set.reps} 
                                                    onChange={(e) => updateSet(ex.id, set.id, 'reps', e.target.value)} 
                                                    className="w-full h-full bg-black rounded-lg text-center text-white font-bold text-sm outline-none focus:ring-1 focus:ring-[#0A84FF] transition-all placeholder-zinc-800" 
                                                />
                                            </div>
                                            <div className="flex justify-center">
                                                <button 
                                                    onClick={() => updateSet(ex.id, set.id, 'completed', !set.completed)} 
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                                        set.completed 
                                                        ? 'bg-[#30D158] text-black' 
                                                        : 'bg-[#2C2C2E] text-transparent hover:bg-[#333]'
                                                    }`}
                                                >
                                                    <Check size={16} strokeWidth={4} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-5 flex justify-center">
                                    <button 
                                        onClick={() => addSet(ex.id)} 
                                        className="text-[#0A84FF] font-bold text-[10px] uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5"
                                    >
                                        <Plus size={12} strokeWidth={3} /> Add Set
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <motion.button 
                    layout
                    onClick={() => setIsLibraryOpen(true)} 
                    className="w-full h-20 rounded-[24px] border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all group active:scale-[0.99]"
                    >
                    <div className="w-8 h-8 rounded-full bg-[#1C1C1E] border border-white/5 group-hover:bg-white flex items-center justify-center text-white group-hover:text-black transition-colors">
                        <Plus size={16} strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Add Exercise</span>
                    </motion.button>
                  </div>

                  <div className="p-6 pt-4 bg-gradient-to-t from-black via-black to-transparent safe-area-bottom fixed bottom-0 left-0 right-0 md:pl-72 md:relative z-40 pointer-events-none">
                    <div className="pointer-events-auto">
                        <SlideToFinish onFinish={onClose} />
                    </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Modals */}
      <ExerciseLibraryModal 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={addExercise}
        mode="select"
      />
      
      <AnimatePresence>
        {isTimerOpen && <TimerModal onClose={() => setIsTimerOpen(false)} />}
      </AnimatePresence>

    </motion.div>,
    document.body
  );
};
