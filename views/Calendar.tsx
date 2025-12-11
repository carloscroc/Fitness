
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Plus, Calendar as CalendarIcon, Clock, Check, Zap, 
  X, Play, MoreHorizontal, Dumbbell, Trash2, RefreshCw, CalendarDays, 
  Edit2, BookOpen, ChevronRight, Utensils, ChevronDown
} from 'lucide-react';
import { AppView, WorkoutDay, Meal, ScheduleItem } from '../types.ts';
import { Button } from '../components/ui/Button.tsx';
import { MealDetailModal } from '../components/MealDetailModal.tsx';
import { ExerciseLibraryModal } from '../components/ExerciseLibraryModal.tsx';
import { Exercise } from '../data/exercises.ts';

// Display Schedule Data for the default strip
const SCHEDULE = [
  { day: 'M', date: '21', status: 'completed' },
  { day: 'T', date: '22', status: 'completed' },
  { day: 'W', date: '23', status: 'missed' },
  { day: 'T', date: '24', status: 'today' },
  { day: 'F', date: '25', status: 'future' },
  { day: 'S', date: '26', status: 'future' },
  { day: 'S', date: '27', status: 'future' },
];

interface CalendarProps {
  onNavigate: (view: AppView, params?: any) => void;
  onStartWorkout?: (workout?: WorkoutDay) => void;
  initialDate?: string;
  scheduleData: Record<string, ScheduleItem[]>;
  onAddToSchedule?: (date: string, item: ScheduleItem) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ onNavigate, onStartWorkout, initialDate = '24', scheduleData, onAddToSchedule }) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [isAdding, setIsAdding] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Calendar Expansion State
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [browsingDate, setBrowsingDate] = useState(new Date());

  // Interaction State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [viewingMeal, setViewingMeal] = useState<Meal | null>(null);
  const [pendingExercises, setPendingExercises] = useState<Exercise[]>([]);
  
  // Scheduling State for Modal
  const [targetDate, setTargetDate] = useState<string>(initialDate);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const selectedWorkouts = scheduleData[selectedDate] || [];

  useEffect(() => {
    setMounted(true);
    // Sync browsing date to current month on mount
    setBrowsingDate(new Date());
    return () => setMounted(false);
  }, []);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    // If we click a date in the full calendar, collapse it
    if (isCalendarExpanded) {
        setIsCalendarExpanded(false);
    }
  };

  const handleOpenAdd = () => {
      setIsAdding(true);
      setPendingExercises([]);
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      const formattedDate = `${year}-${month}-${day}`;
      setTargetDate(formattedDate); 
      setCalendarMonth(today);
  };

  const handleMultiSelectFromLibrary = (exercises: Exercise[]) => {
      setPendingExercises(prev => {
          // Prevent duplicates by ID
          const newExercises = exercises.filter(nex => !prev.some(pex => pex.id === nex.id));
          return [...prev, ...newExercises];
      });
      setIsLibraryOpen(false);
  };

  const handleRemovePending = (idx: number) => {
      setPendingExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddActivity = () => {
    if (pendingExercises.length === 0) return;

    let displayTitle = "Custom Workout";
    if (pendingExercises.length === 1) {
        displayTitle = pendingExercises[0].name;
    } else if (pendingExercises.length > 1) {
        const muscles = pendingExercises.map(e => e.muscle);
        const counts: Record<string, number> = {};
        let maxCount = 0;
        let dominantMuscle = '';
        
        muscles.forEach(m => {
            counts[m] = (counts[m] || 0) + 1;
            if (counts[m] > maxCount) {
                maxCount = counts[m];
                dominantMuscle = m;
            }
        });
        
        if (maxCount >= Math.ceil(pendingExercises.length / 2)) {
             displayTitle = `${dominantMuscle} Focus`;
        } else {
             displayTitle = "Mixed Session";
        }
    }

    if (onAddToSchedule) {
        const mappedExercises = pendingExercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            sets: 3,
            reps: '10',
            rest: 60,
            videoThumb: ex.image,
            libraryId: ex.id
        }));

        const newItem: ScheduleItem = {
            id: `sched-${Date.now()}`,
            title: displayTitle,
            subtitle: `${mappedExercises.length} Exercises`,
            duration: '45 min', 
            completed: false,
            assignedBy: 'USER',
            category: 'WORKOUT',
            status: 'Scheduled',
            image: mappedExercises.length > 0 
                ? mappedExercises[0].videoThumb 
                : 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
            exercises: mappedExercises
        };
        
        onAddToSchedule(targetDate, newItem);
        
        const dayPart = targetDate.split('-')[2];
        if (['21','22','23','24','25','26','27'].includes(dayPart)) {
             setSelectedDate(dayPart);
        } else {
             setSelectedDate(targetDate);
        }
    }

    setIsAdding(false);
    setPendingExercises([]);
  };

  const handleCardClick = (workout: ScheduleItem) => {
    if (workout.category === 'NUTRITION' && workout.mealData) {
        setViewingMeal(workout.mealData);
    } else if (workout.status === 'In Progress' && onStartWorkout) {
        onStartWorkout(workout);
    } else {
        onNavigate(AppView.COACH, { tab: 'Library' });
    }
  };

  // --- Full Calendar Logic ---
  const handlePrevBrowsingMonth = () => {
    setBrowsingDate(new Date(browsingDate.getFullYear(), browsingDate.getMonth() - 1, 1));
  };

  const handleNextBrowsingMonth = () => {
    setBrowsingDate(new Date(browsingDate.getFullYear(), browsingDate.getMonth() + 1, 1));
  };

  // Add modal calendar logic
  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

  const hasActivity = (dayStr: string) => {
      if (scheduleData[dayStr] && scheduleData[dayStr].length > 0) return true;
      const simpleDay = dayStr.split('-')[2];
      const today = new Date();
      const viewingSameAsCurrent = browsingDate.getMonth() === today.getMonth() && browsingDate.getFullYear() === today.getFullYear();
      if (viewingSameAsCurrent && scheduleData[simpleDay] && scheduleData[simpleDay].length > 0) return true;
      return false;
  };

  return (
    <div className="min-h-screen bg-black text-white relative pb-10 font-sans">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl pt-[env(safe-area-inset-top)] pb-2 border-b border-white/5">
        <div className="px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => onNavigate(AppView.DASHBOARD)} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1C1C1E] border border-white/10 text-white hover:bg-[#2C2C2E] transition-colors active:scale-95"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          
          <button 
            onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
            className="flex flex-col items-center cursor-pointer active:opacity-70 transition-opacity"
          >
            <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold font-display tracking-tight leading-none mb-0.5">
                    {isCalendarExpanded ? monthNames[browsingDate.getMonth()] : 'Schedule'}
                </h1>
                <ChevronDown 
                    size={14} 
                    className={`text-zinc-400 transition-transform duration-300 ${isCalendarExpanded ? 'rotate-180' : ''}`} 
                    strokeWidth={3}
                />
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {isCalendarExpanded ? browsingDate.getFullYear() : `${selectedWorkouts.length} Activities`}
            </p>
          </button>

          <button 
            onClick={handleOpenAdd}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors active:scale-95 shadow-lg"
          >
             <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Expandable Calendar Area */}
        <motion.div
            initial={false}
            animate={{ height: isCalendarExpanded ? 'auto' : 'auto' }}
            className="overflow-hidden bg-[#0A0A0A] border-b border-white/5 relative z-30"
        >
            <AnimatePresence initial={false} mode="wait">
                {isCalendarExpanded ? (
                    <motion.div
                        key="full-grid"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="px-6 pb-6 pt-2"
                    >
                        {/* Month Nav */}
                        <div className="flex justify-between items-center mb-4 px-2">
                            <button onClick={handlePrevBrowsingMonth} className="p-2 -ml-2 text-zinc-400 hover:text-white"><ChevronLeft size={20} /></button>
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                {monthNames[browsingDate.getMonth()]}
                            </span>
                            <button onClick={handleNextBrowsingMonth} className="p-2 -mr-2 text-zinc-400 hover:text-white"><ChevronRight size={20} /></button>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 mb-2 text-center">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                <div key={d} className="text-[9px] font-bold text-zinc-600 uppercase py-2">{d}</div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                            {Array(new Date(browsingDate.getFullYear(), browsingDate.getMonth(), 1).getDay()).fill(null).map((_, i) => <div key={`blank-${i}`} />)}
                            
                            {Array.from({ length: new Date(browsingDate.getFullYear(), browsingDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(d => {
                                const year = browsingDate.getFullYear();
                                const month = String(browsingDate.getMonth() + 1).padStart(2, '0');
                                const day = String(d).padStart(2, '0');
                                const fullDate = `${year}-${month}-${day}`;
                                
                                const isSelected = selectedDate === fullDate || (selectedDate === String(d) && browsingDate.getMonth() === new Date().getMonth());
                                const isToday = fullDate === new Date().toISOString().split('T')[0];
                                const hasDots = hasActivity(fullDate) || hasActivity(String(d)); 

                                return (
                                    <button
                                        key={d}
                                        onClick={() => handleDateClick(fullDate)}
                                        className={`aspect-square rounded-full flex flex-col items-center justify-center text-[13px] font-bold transition-all relative group ${
                                            isSelected 
                                            ? 'bg-[#0A84FF] text-white shadow-[0_0_15px_rgba(10,132,255,0.4)] scale-100 z-10' 
                                            : isToday 
                                                ? 'bg-[#1C1C1E] text-[#0A84FF] border border-[#0A84FF]/30' 
                                                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <span className="relative z-10">{d}</span>
                                        {hasDots && !isSelected && (
                                            <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isToday ? 'bg-[#0A84FF]' : 'bg-zinc-600'}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div 
                            className="flex justify-center pt-4 -mb-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                            onClick={() => setIsCalendarExpanded(false)}
                        >
                            <div className="w-12 h-1 bg-zinc-800 rounded-full" />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="strip"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-5 mt-4 mb-4 touch-pan-x"
                    >
                        {/* Horizontal Date Strip */}
                        <div className="flex justify-between items-end">
                            {SCHEDULE.map((day, i) => {
                            const isSelected = selectedDate === day.date;
                            const isToday = day.status === 'today';
                            const isCompleted = day.status === 'completed';
                            
                            return (
                                <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group relative" onClick={() => handleDateClick(day.date)}>
                                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isSelected ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                                    {day.day}
                                </span>
                                
                                <div className={`w-[44px] h-[44px] flex flex-col items-center justify-center rounded-full transition-all relative z-10 ${isSelected ? 'bg-[#0A84FF] text-white shadow-[0_0_15px_rgba(10,132,255,0.4)] scale-110' : 'bg-transparent text-zinc-300 hover:bg-white/5'}`}>
                                    {isSelected && (
                                        <motion.div layoutId="activeDay" className="absolute inset-0 bg-[#0A84FF] rounded-full -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                                    )}
                                    <span className="text-[18px] font-bold font-display leading-none pt-0.5 relative z-10">{day.date}</span>
                                    
                                    {!isSelected && (isCompleted || isToday) && (
                                        <div className={`mt-1.5 w-1 h-1 rounded-full ${isToday ? 'bg-[#0A84FF]' : 'bg-zinc-700'}`} />
                                    )}
                                </div>
                                </div>
                            );
                            })}
                        </div>
                        
                        <div 
                            className="flex justify-center pt-3 pb-1 cursor-pointer opacity-0 hover:opacity-50 transition-opacity"
                            onClick={() => setIsCalendarExpanded(true)}
                        >
                            <div className="w-8 h-1 bg-zinc-800 rounded-full" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
      </div>

      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-6 space-y-4"
      >
          {/* Activity Feed */}
          <div className="pb-32">
              <AnimatePresence mode='wait'>
              {selectedWorkouts.length > 0 ? (
                  <motion.div
                      key={selectedDate}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex overflow-x-auto gap-4 px-6 pb-8 snap-x snap-mandatory no-scrollbar"
                  >
                      {selectedWorkouts.map((workout, idx) => {
                          const isInProgress = workout.status === 'In Progress';
                          const isMissed = workout.status === 'Missed';
                          const isCompleted = workout.status === 'Completed';
                          const isScheduled = workout.status === 'Scheduled';

                          return (
                              <motion.div
                                  key={workout.id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: idx * 0.1 }}
                                  onClick={() => handleCardClick(workout)}
                                  className="relative h-[55vh] max-h-[500px] w-[85vw] md:w-[380px] shrink-0 snap-center rounded-[36px] overflow-hidden group cursor-pointer border border-white/10 shadow-2xl active:scale-[0.99] transition-transform bg-[#111]"
                              >
                                  <img 
                                      src={workout.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop'} 
                                      className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isCompleted || isMissed ? 'grayscale opacity-40' : 'opacity-80'}`}
                                      alt={workout.title}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-80" />

                                  <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start">
                                      <div className="flex flex-col gap-2 items-start">
                                          <div className="flex items-center gap-2">
                                              {isInProgress && (
                                                <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2 shadow-lg">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse shadow-[0_0_8px_#3B82F6]" />
                                                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">IN PROGRESS</span>
                                                </div>
                                              )}
                                              {workout.currentSet && isInProgress && (
                                                  <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold text-zinc-300 uppercase tracking-wider">
                                                     {workout.currentSet}
                                                  </div>
                                              )}
                                          </div>

                                          {workout.coachAssigned && (
                                              <div className="px-3 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-500/30 flex items-center gap-1.5 text-[9px] font-bold text-blue-100 uppercase tracking-wider shadow-lg">
                                                  <Zap size={10} className="fill-current" /> COACH ASSIGNED
                                              </div>
                                          )}
                                          {isMissed && (
                                            <div className="px-3 py-1.5 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/20 text-[9px] font-bold text-red-100 uppercase tracking-wider">
                                                MISSED
                                            </div>
                                          )}
                                          {isScheduled && (
                                            <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white uppercase tracking-wider">
                                                SCHEDULED
                                            </div>
                                          )}
                                      </div>

                                      {isCompleted && (
                                          <div className="w-8 h-8 rounded-full bg-[#30D158] flex items-center justify-center shadow-[0_0_15px_rgba(48,209,88,0.4)] border border-[#30D158] text-white">
                                              <Check size={16} strokeWidth={3} />
                                          </div>
                                      )}
                                  </div>

                                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                      <h3 className="text-[32px] md:text-[36px] font-bold font-display text-white mb-3 tracking-tight leading-[0.95] drop-shadow-xl">
                                          {workout.title}
                                      </h3>
                                      
                                      <div className="flex items-center gap-4 mb-6">
                                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0A84FF]">
                                              {workout.category === 'NUTRITION' ? <Utensils size={14} fill="currentColor" /> : <Dumbbell size={14} fill="currentColor" />}
                                              <span>{workout.typeLabel || workout.subtitle}</span>
                                          </div>
                                          <div className="w-1 h-1 rounded-full bg-zinc-500" />
                                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                                              <Play size={12} className="fill-current" />
                                              <span>{workout.timeLeft || workout.duration}</span>
                                          </div>
                                      </div>

                                      {isInProgress ? (
                                        <div className="flex gap-3">
                                            <Button 
                                              onClick={(e) => { e.stopPropagation(); onStartWorkout && onStartWorkout(workout); }}
                                              className="flex-1 bg-white text-black h-14 rounded-full text-base font-bold shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:bg-zinc-200 border-none"
                                            >
                                               <Play size={18} className="fill-current mr-2" /> Resume Workout
                                            </Button>
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); setActiveMenuId(workout.id); }}
                                              className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                                            >
                                               <MoreHorizontal size={20} />
                                            </button>
                                        </div>
                                      ) : isMissed ? (
                                        <Button 
                                          variant="secondary"
                                          className="w-full bg-white/10 text-white h-14 rounded-full text-base font-bold backdrop-blur-md border-white/10 hover:bg-white/20"
                                        >
                                           Browse Recovery
                                        </Button>
                                      ) : isCompleted ? (
                                          <div className="flex gap-3">
                                              <Button 
                                                  className="flex-1 bg-zinc-800 text-zinc-400 h-14 rounded-full text-base font-bold border border-white/5 cursor-default"
                                              >
                                                  <Check size={18} className="mr-2" /> Completed
                                              </Button>
                                          </div>
                                      ) : (
                                        <div className="flex gap-3">
                                            <Button 
                                              onClick={(e) => { e.stopPropagation(); if (workout.category === 'NUTRITION' && workout.mealData) { setViewingMeal(workout.mealData); } else { onStartWorkout && onStartWorkout(workout); } }}
                                              className="flex-1 bg-white text-black h-14 rounded-full text-base font-bold shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:bg-zinc-200 border-none"
                                            >
                                               {workout.category === 'NUTRITION' ? 'View Meal Plan' : <><Play size={18} className="fill-current mr-2" /> Start Session</>}
                                            </Button>
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); setActiveMenuId(workout.id); }}
                                              className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                                            >
                                               <MoreHorizontal size={20} />
                                            </button>
                                        </div>
                                      )}
                                  </div>
                              </motion.div>
                          );
                      })}
                      <div className="w-2 shrink-0" />
                  </motion.div>
              ) : (
                  <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-6 py-24 flex flex-col items-center justify-center text-center space-y-5 opacity-60"
                  >
                      <div className="w-16 h-16 bg-[#1C1C1E] rounded-full flex items-center justify-center text-[#333] border border-white/5">
                          <CalendarIcon size={28} strokeWidth={1.5} />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-white font-display">No Activities</h3>
                          <p className="text-[#555] text-xs font-medium uppercase tracking-wide">Take a rest day</p>
                      </div>
                      <Button 
                          onClick={handleOpenAdd} 
                          variant="secondary"
                          className="!rounded-full !px-8 h-12 text-xs bg-[#1C1C1E] border border-white/10"
                      >
                          Schedule Activity
                      </Button>
                  </motion.div>
              )}
              </AnimatePresence>
          </div>
      </motion.div>

      {/* Add Activity Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isAdding && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAdding(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000]"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-[1001] bg-[#101010] rounded-t-[32px] shadow-2xl flex flex-col max-h-[90vh] pb-8 safe-area-bottom border-t border-white/10 overflow-hidden"
              >
                 <div className="flex justify-center pt-3 pb-2 shrink-0 bg-[#101010]">
                    <div className="w-10 h-1 bg-zinc-800 rounded-full" />
                 </div>

                <div className="flex justify-between items-center px-6 pt-2 pb-4 shrink-0 bg-[#101010] z-10">
                  <h3 className="text-xl font-bold font-display text-white tracking-tight">Schedule Activity</h3>
                  <button onClick={() => setIsAdding(false)} className="w-8 h-8 flex items-center justify-center bg-[#1C1C1E] rounded-full hover:bg-zinc-800 transition-colors text-white border border-white/5">
                    <X size={16} strokeWidth={2} />
                  </button>
                </div>

                <div className="px-6 overflow-y-auto space-y-6 flex-1 bg-[#101010]">
                  
                  {/* Embedded Calendar Picker */}
                  <div className="bg-[#1C1C1E] rounded-[24px] p-5 border border-white/5 shadow-inner">
                      <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                              <CalendarIcon size={12} /> Target Date
                          </span>
                          <div className="flex items-center gap-3">
                               <button onClick={handlePrevMonth} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                                  <ChevronLeft size={14} />
                               </button>
                               <span className="text-xs font-bold text-white uppercase tracking-wide">
                                  {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                               </span>
                               <button onClick={handleNextMonth} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                                  <ChevronRight size={14} />
                               </button>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                              <div key={d} className="text-[9px] font-bold text-zinc-600 uppercase">{d}</div>
                          ))}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1.5">
                           {Array(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay()).fill(null).map((_, i) => <div key={`blank-${i}`} />)}
                           
                           {Array.from({ length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(d => {
                              const year = calendarMonth.getFullYear();
                              const month = String(calendarMonth.getMonth() + 1).padStart(2, '0');
                              const day = String(d).padStart(2, '0');
                              const fullDate = `${year}-${month}-${day}`;
                              
                              const isSelected = targetDate === fullDate;
                              const todayObj = new Date();
                              const isToday = fullDate === `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

                              return (
                                 <button
                                    key={d}
                                    onClick={() => setTargetDate(fullDate)}
                                    className={`aspect-square rounded-[10px] flex flex-col items-center justify-center text-sm font-bold transition-all relative ${
                                       isSelected 
                                       ? 'bg-[#0A84FF] text-white shadow-lg scale-105 z-10' 
                                       : isToday 
                                         ? 'bg-[#1C1C1E] text-[#0A84FF] border border-[#0A84FF]/30' 
                                         : 'bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                 >
                                    {d}
                                    {isToday && !isSelected && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#0A84FF]" />}
                                 </button>
                              );
                           })}
                      </div>
                  </div>

                  {pendingExercises.length > 0 ? (
                      <div className="space-y-3">
                          <div className="flex items-center justify-between px-1">
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Selected Exercises</span>
                              <button onClick={() => setIsLibraryOpen(true)} className="text-[10px] font-bold text-[#0A84FF] uppercase tracking-widest hover:text-white transition-colors">Edit</button>
                          </div>
                          {pendingExercises.map((ex, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-[#1C1C1E] rounded-2xl border border-white/5">
                                  <div className="flex items-center gap-3">
                                      <img src={ex.image} className="w-10 h-10 rounded-lg object-cover opacity-80" />
                                      <span className="text-sm font-bold text-white">{ex.name}</span>
                                  </div>
                                  <button onClick={() => handleRemovePending(idx)} className="p-2 text-zinc-500 hover:text-red-500 transition-colors">
                                      <X size={16} />
                                  </button>
                              </div>
                          ))}
                          <button 
                            onClick={() => setIsLibraryOpen(true)}
                            className="w-full py-3 rounded-2xl border border-dashed border-white/10 flex items-center justify-center gap-2 text-zinc-500 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-wide"
                          >
                            <Plus size={14} /> Add More
                          </button>
                      </div>
                  ) : (
                    <button 
                        onClick={() => setIsLibraryOpen(true)}
                        className="w-full bg-[#1C1C1E] border border-white/10 p-4 rounded-[24px] flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-[#222] shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#2C2C2E] flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors border border-white/5">
                                <BookOpen size={20} />
                            </div>
                            <div className="text-left">
                                <div className="text-white font-bold text-sm mb-0.5">Select from Library</div>
                                <div className="text-zinc-500 text-xs font-medium">Choose from database</div>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors bg-black">
                            <ChevronRight size={16} />
                        </div>
                    </button>
                  )}
                </div>
                
                <div className="p-6 mt-4 shrink-0 bg-[#101010]">
                   <Button 
                     onClick={handleAddActivity}
                     disabled={pendingExercises.length === 0}
                     className="w-full bg-white text-black hover:bg-zinc-200 h-16 rounded-[24px] text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-transform disabled:opacity-50"
                   >
                     Confirm Schedule
                   </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {mounted && createPortal(
        <AnimatePresence>
            {activeMenuId && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActiveMenuId(null)}
                    className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-[#1C1C1E] w-full md:w-[400px] rounded-t-[32px] md:mb-6 md:rounded-[32px] p-4 pb-8 border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-1 bg-zinc-700 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <button className="w-full p-4 bg-[#2C2C2E] hover:bg-[#333] rounded-2xl flex items-center gap-4 text-white font-bold text-sm transition-colors active:scale-[0.98]">
                                <Edit2 size={20} /> Edit Activity
                            </button>
                            <button className="w-full p-4 bg-[#2C2C2E] hover:bg-[#333] rounded-2xl flex items-center gap-4 text-white font-bold text-sm transition-colors active:scale-[0.98]">
                                <CalendarDays size={20} /> Reschedule
                            </button>
                            <button className="w-full p-4 bg-[#2C2C2E] hover:bg-[#333] rounded-2xl flex items-center gap-4 text-white font-bold text-sm transition-colors active:scale-[0.98]">
                                <RefreshCw size={20} /> Repeat Next Week
                            </button>
                            <button onClick={() => { setActiveMenuId(null); }} className="w-full p-4 bg-[#2C2C2E] hover:bg-[#333] rounded-2xl flex items-center gap-4 text-red-500 font-bold text-sm transition-colors active:scale-[0.98]">
                                <Trash2 size={20} /> Remove from Schedule
                            </button>
                        </div>
                        <button onClick={() => setActiveMenuId(null)} className="w-full mt-4 p-4 bg-black border border-white/10 rounded-2xl text-white font-bold text-sm active:scale-[0.98]">
                            Cancel
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
      )}

      <AnimatePresence>
        {viewingMeal && (
            <MealDetailModal 
                meal={viewingMeal}
                onClose={() => setViewingMeal(null)}
                isLibraryItem={false}
            />
        )}
      </AnimatePresence>

      <ExerciseLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onMultiSelect={handleMultiSelectFromLibrary}
        mode="select"
        multiSelect={true}
      />

    </div>
  );
};
