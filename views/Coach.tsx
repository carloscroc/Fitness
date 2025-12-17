
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Search, Dumbbell, X, Plus, Clock, Calendar, Filter, Trophy, TrendingUp, BookOpen, ChevronRight, Zap, CheckCircle2, Lock, ArrowRight, Play, MoreHorizontal, ChevronDown, Info, Check } from 'lucide-react';
import { WorkoutDay, AppView, ScheduleItem } from '../types.ts';
import { Button } from '../components/ui/Button.tsx';
import { Vision } from './Vision.tsx';
import { EXERCISE_DB, EXERCISE_CATEGORIES, Exercise } from '../data/exercises.ts';
import { ExerciseDetailModal } from '../components/ExerciseDetailModal.tsx';
import VideoPreview from '../components/VideoPreview.tsx';

type Tab = 'Library' | 'Body' | 'History';

const WORKOUT_HISTORY = [
  {
    id: 'wh1',
    title: 'Upper Body Power',
    date: 'Oct 24',
    time: '6:30 PM',
    duration: '1h 15m',
    volume: '15,400 lbs',
    prs: 3,
    muscles: 'Chest, Back',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'wh2',
    title: 'Leg Hypertrophy',
    date: 'Oct 22',
    time: '7:00 AM',
    duration: '55m',
    volume: '18,200 lbs',
    prs: 1,
    muscles: 'Quads, Hamstrings',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'wh3',
    title: 'Active Recovery',
    date: 'Oct 21',
    time: '8:00 AM',
    duration: '30m',
    volume: '0 lbs',
    prs: 0,
    muscles: 'Cardio, Mobility',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'wh4',
    title: 'Pull Strength',
    date: 'Oct 19',
    time: '5:45 PM',
    duration: '1h 05m',
    volume: '14,100 lbs',
    prs: 2,
    muscles: 'Back, Biceps',
    image: 'https://images.unsplash.com/photo-1603287681836-e174ce7562f2?q=80&w=400&auto=format&fit=crop'
  }
];

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  },
  exit: { opacity: 0, y: -10 }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface CoachProps {
  initialTab?: string;
  initialExerciseId?: string;
  onLogClick?: () => void;
  onStartWorkout?: (workout?: WorkoutDay) => void;
  onNavigate: (view: AppView, params?: any) => void;
  onAddToSchedule?: (date: string, item: ScheduleItem) => void;
}

export const Coach: React.FC<CoachProps> = ({ initialTab, initialExerciseId, onLogClick, onStartWorkout, onNavigate, onAddToSchedule }) => {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
      if (initialTab && ['Library', 'Body', 'History'].includes(initialTab)) {
          return initialTab as Tab;
      }
      return 'Library';
  });
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryCategory, setLibraryCategory] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  
  useEffect(() => { 
    if (initialTab && ['Library', 'Body', 'History'].includes(initialTab)) {
        setActiveTab(initialTab as Tab); 
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialExerciseId) {
      const ex = EXERCISE_DB.find(e => e.id === initialExerciseId);
      if (ex) {
        setSelectedExercise(ex);
        if (activeTab !== 'Library') setActiveTab('Library');
      }
    }
  }, [initialExerciseId]);

  const showToast = (msg: string) => {
      setToast(msg);
      setTimeout(() => setToast(null), 2500);
  };

  const handleHistoryClick = (historyItem: any) => {
    const day: WorkoutDay = {
        id: historyItem.id,
        title: historyItem.title,
        subtitle: historyItem.muscles,
        duration: historyItem.duration,
        exercises: [], // Mock or fetch exercises
        completed: true,
        dayLabel: historyItem.date,
        assignedBy: 'USER'
    };
    // Mock exercises for display
    day.exercises = EXERCISE_DB.slice(0, 5).map(ex => ({
      id: ex.id,
      name: ex.name,
      sets: 3,
      reps: '10',
      rest: 60,
      videoThumb: ex.image,
      libraryId: ex.id
    })); 
    setSelectedDay(day);
  };

  const handleExerciseAction = (action?: 'SCHEDULE' | 'START', date?: string) => {
      if (!selectedExercise) return;

      if (action === 'START') {
          const workout: WorkoutDay = {
              id: `quick-${Date.now()}`,
              title: selectedExercise.name,
              subtitle: 'Quick Session',
              duration: 'Open',
              exercises: [{
                  id: selectedExercise.id,
                  name: selectedExercise.name,
                  sets: 3,
                  reps: '10',
                  rest: 60,
                  videoThumb: selectedExercise.image,
                  lastWeight: '',
                  libraryId: selectedExercise.id
              }],
              completed: false,
              assignedBy: 'USER'
          };
          onStartWorkout?.(workout);
      } else if (action === 'SCHEDULE' && date) {
          if (onAddToSchedule) {
              const newItem: ScheduleItem = {
                  id: `sched-${Date.now()}`,
                  title: selectedExercise.name, // Will be overwritten if merged
                  subtitle: selectedExercise.muscle,
                  duration: '45 min',
                  exercises: [{
                      id: selectedExercise.id,
                      name: selectedExercise.name,
                      sets: 3,
                      reps: '10',
                      rest: 60,
                      videoThumb: selectedExercise.image,
                      libraryId: selectedExercise.id
                  }],
                  completed: false,
                  assignedBy: 'USER', // Crucial for merging
                  category: 'WORKOUT',
                  status: 'Scheduled',
                  typeLabel: 'Custom',
                  image: selectedExercise.image
              };
              onAddToSchedule(date, newItem);
              
              const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              showToast(`Added to schedule for ${formattedDate}`);
          }
      } else {
          showToast(`Action Completed`);
      }
      setSelectedExercise(null);
  };

  const renderLibrary = () => {
    const filteredExercises = EXERCISE_DB.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = libraryCategory === 'All' || ex.muscle === libraryCategory;
      return matchesSearch && matchesCategory;
    });

    return (
      <motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6 pb-32 px-6">
        <motion.div variants={itemVariants} className="space-y-4">
           {/* Search & Filter Header */}
           <div className="flex gap-3">
             <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search exercises..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-[#1C1C1E] border border-white/15 rounded-[20px] py-4 pl-12 pr-4 text-white placeholder-zinc-400 focus:outline-none focus:border-white/30 transition-all font-medium text-[15px]"
               />
             </div>
             <button className="w-[54px] bg-[#1C1C1E] border border-white/15 rounded-[20px] flex items-center justify-center text-white hover:bg-[#2C2C2E] transition-colors active:scale-95">
                <Filter size={20} />
             </button>
           </div>

           {/* Categories */}
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-6 px-6">
              {EXERCISE_CATEGORIES.map(cat => (
                 <button 
                   key={cat}
                   onClick={() => setLibraryCategory(cat)}
                   className={`px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
                      libraryCategory === cat 
                      ? 'bg-white text-black border-white shadow-lg' 
                      : 'bg-[#1C1C1E] text-zinc-400 border-white/10 hover:border-white/20 hover:text-white'
                   }`}
                 >
                    {cat}
                 </button>
              ))}
           </div>
        </motion.div>

        {/* Results Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
           {filteredExercises.map(ex => (
              <motion.div 
                key={ex.id} 
                layoutId={`lib-${ex.id}`}
                onClick={() => setSelectedExercise(ex)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedExercise(ex); } }}
                tabIndex={0}
                role="button"
                className="aspect-square relative bg-[#1C1C1E] rounded-[32px] overflow-hidden active:scale-[0.98] transition-transform cursor-pointer group border border-white/15"
              >
                 <VideoPreview exercise={ex} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                 
                 <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <Plus size={16} className="text-white" />
                    </div>
                 </div>

                 <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">{ex.muscle}</p>
                    <h3 className="text-[17px] font-bold font-display text-white leading-[1.1]">{ex.name}</h3>
                 </div>
              </motion.div>
           ))}
        </motion.div>
        
        {filteredExercises.length === 0 && (
            <div className="text-center py-10 text-gray-400">
                <p className="text-sm font-medium">No exercises found.</p>
            </div>
        )}

        <div className="pt-8 text-center pb-4">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-4">Don't see an exercise?</p>
            <Button variant="secondary" className="h-10 text-xs bg-[#1C1C1E] border-white/15 text-white hover:bg-white/10 w-auto px-6 mx-auto">
                Request to Library
            </Button>
        </div>
      </motion.div>
    );
  };

  const renderHistory = () => (
    <motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4 pb-32 px-6">
       {/* Summary Stats */}
       <div className="grid grid-cols-2 gap-3 mb-6">
          <div onClick={() => onNavigate(AppView.PROGRESS, { metric: 'workouts' })} className="bg-[#1C1C1E] p-5 rounded-[28px] border border-white/10 relative overflow-hidden group cursor-pointer hover:bg-[#2C2C2E] transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Trophy size={48} />
              </div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Workouts</div>
              <div className="text-3xl font-bold font-display text-white">42</div>
              <div className="text-xs text-green-500 font-bold mt-1 flex items-center gap-1">+3 this week</div>
          </div>
          <div onClick={() => onNavigate(AppView.PROGRESS, { metric: 'volume' })} className="bg-[#1C1C1E] p-5 rounded-[28px] border border-white/10 relative overflow-hidden group cursor-pointer hover:bg-[#2C2C2E] transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp size={48} />
              </div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Volume</div>
              <div className="text-3xl font-bold font-display text-white">125k</div>
               <div className="text-xs text-zinc-400 font-bold mt-1">lbs lifted</div>
          </div>
       </div>

       <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-sm font-bold text-white">Recent Sessions</h3>
          <button onClick={() => onNavigate(AppView.PROGRESS)} className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wide">View All</button>
       </div>

       <div className="space-y-3">
          {WORKOUT_HISTORY.map((workout) => (
             <motion.div 
               key={workout.id}
               variants={itemVariants}
               onClick={() => handleHistoryClick(workout)}
               className="bg-[#1C1C1E] p-4 rounded-[24px] border border-white/5 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer group hover:bg-[#2C2C2E]"
             >
                <div className="w-16 h-16 rounded-2xl bg-[#111] border border-white/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{workout.date.split(' ')[0]}</span>
                    <span className="text-xl font-bold font-display text-white">{workout.date.split(' ')[1]}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-white font-display mb-1 truncate">{workout.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
                        <span className="flex items-center gap-1"><Clock size={12} /> {workout.duration}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-600" />
                        <span>{workout.muscles}</span>
                    </div>
                </div>

                {workout.prs > 0 && (
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                        <Trophy size={16} className="fill-current" />
                    </div>
                )}
             </motion.div>
          ))}
       </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black relative pt-0 text-white font-sans">
      
      {/* Header */}
      <div className="pt-[calc(env(safe-area-inset-top)+20px)] px-6 pb-2 sticky top-0 z-30 pointer-events-none bg-gradient-to-b from-black via-black/90 to-transparent">
        <div className="flex justify-between items-start pointer-events-auto">
          <div>
            <h1 className="text-4xl font-extrabold font-display text-white tracking-tight leading-none mb-1.5 drop-shadow-lg">Coach</h1>
            <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">Week 4 • Hypertrophy</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => onNavigate(AppView.CALENDAR)} className="w-11 h-11 flex items-center justify-center rounded-full bg-[#1C1C1E] text-white border border-white/10 active:scale-95 transition-transform hover:bg-[#2C2C2E]">
               <Calendar size={20} strokeWidth={2} />
             </button>
          </div>
        </div>

        {/* Tabs inside Sticky Header */}
        <div className="mt-6 pointer-events-auto overflow-x-auto no-scrollbar pb-2">
             <div className="flex gap-8">
                {(['Library', 'Body', 'History'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 text-[15px] font-bold transition-all relative whitespace-nowrap ${
                      activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                        <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    )}
                  </button>
                ))}
              </div>
        </div>
      </div>
            
      <div className="pt-2">
        <AnimatePresence mode='wait'>
            {activeTab === 'Library' && <motion.div key="library">{renderLibrary()}</motion.div>}
            {activeTab === 'Body' && <motion.div key="body"><Vision /></motion.div>}
            {activeTab === 'History' && <motion.div key="history">{renderHistory()}</motion.div>}
        </AnimatePresence>
      </div>

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {selectedExercise && (
           <ExerciseDetailModal 
             exercise={selectedExercise} 
             onClose={() => setSelectedExercise(null)}
             onAddToWorkout={handleExerciseAction}
           />
        )}
      </AnimatePresence>

      {/* Workout Detail Sheet Portal */}
      {createPortal(
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-end md:items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedDay(null)} />
              
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="bg-[#1C1C1E] w-full md:w-[500px] h-[90vh] md:h-auto md:rounded-[32px] rounded-t-[32px] shadow-2xl relative overflow-hidden flex flex-col border border-white/15"
              >
                {/* Parallax Header */}
                <div className="relative h-[220px] shrink-0 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-transparent to-transparent" />
                    
                    <button onClick={() => setSelectedDay(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-colors z-20">
                      <X size={18} />
                   </button>

                   <div className="absolute bottom-6 left-6 right-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white mb-2">
                         <Calendar size={12} /> {selectedDay.dayLabel || 'Week 4 • Day 1'}
                      </div>
                      <h1 className="text-3xl font-bold font-display text-white leading-tight drop-shadow-lg">{selectedDay.title}</h1>
                   </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 bg-[#1C1C1E] relative -mt-4 rounded-t-[24px]">
                   <div className="flex gap-4 mb-8 pt-4">
                       <div className="flex-1 bg-[#2C2C2E] rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
                           <Clock size={18} className="text-zinc-400 mb-1" />
                           <span className="text-sm font-bold text-white">{selectedDay.duration}</span>
                           <span className="text-[9px] text-zinc-500 uppercase font-bold">Duration</span>
                       </div>
                       <div className="flex-1 bg-[#2C2C2E] rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
                           <Dumbbell size={18} className="text-zinc-400 mb-1" />
                           <span className="text-sm font-bold text-white">{selectedDay.exercises?.length || 0}</span>
                           <span className="text-[9px] text-zinc-500 uppercase font-bold">Exercises</span>
                       </div>
                       <div className="flex-1 bg-[#2C2C2E] rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
                           <Zap size={18} className="text-[#0A84FF] mb-1" fill="currentColor" />
                           <span className="text-sm font-bold text-white">High</span>
                           <span className="text-[9px] text-zinc-500 uppercase font-bold">Intensity</span>
                       </div>
                   </div>

                   <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-4 px-1">Workout Plan</h3>
                   <div className="space-y-3">
                      {(selectedDay.exercises && selectedDay.exercises.length > 0 ? selectedDay.exercises : []).map((ex, i) => (
                         <motion.div 
                             initial={{ opacity: 0, x: -10 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: i * 0.05 }}
                             key={i} 
                             onClick={() => setSelectedExercise(EXERCISE_DB.find(e => e.name === ex.name) || null)}
                             className="bg-[#2C2C2E] border border-white/5 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-[#333] transition-colors group"
                         >
                             <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-[#1C1C1E] flex items-center justify-center text-sm font-bold text-zinc-500 shadow-sm border border-white/5 group-hover:border-white/10 group-hover:text-white transition-colors">{i + 1}</div>
                                 <div>
                                    <div className="font-bold text-white text-[15px] mb-0.5">{ex.name}</div>
                                    <div className="text-xs text-zinc-400">{ex.sets} sets • {ex.reps} reps</div>
                                 </div>
                             </div>
                             <div className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 group-hover:bg-white/10 group-hover:text-white transition-colors">
                                 <Info size={16} />
                             </div>
                         </motion.div>
                      ))}
                   </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-white/10 bg-[#1C1C1E] safe-area-bottom">
                   <Button onClick={() => { 
                       if (selectedDay.completed && selectedDay.assignedBy === 'USER') {
                           // For history items, maybe repeat workout?
                           if (onStartWorkout) onStartWorkout({ ...selectedDay, id: `repeat-${Date.now()}` });
                       } else {
                           if (onStartWorkout) onStartWorkout(selectedDay);
                       }
                       setSelectedDay(null); 
                   }} className="w-full bg-white text-black hover:bg-zinc-200 py-4 h-14 rounded-[20px] text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      {selectedDay.completed ? 'Repeat Workout' : 'Start Workout'}
                   </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Simple Toast */}
      <AnimatePresence>
        {toast && (
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-[#30D158] text-white px-5 py-3 rounded-full font-bold text-sm shadow-2xl flex items-center gap-2 z-[200]"
            >
                <Check size={16} strokeWidth={3} /> {toast}
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
