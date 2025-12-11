
import React, { useState } from 'react';
import { 
  Search, Bell, Flame, Calendar as CalendarIcon, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { AppView, WorkoutDay } from '../types.ts';
import { TimerModal } from '../components/TimerModal.tsx';
import { NotificationsModal } from '../components/NotificationsModal.tsx';
import { GlobalSearchModal } from '../components/GlobalSearchModal.tsx';
import { EXERCISE_DB } from '../data/exercises.ts';

// Nutrition Data
const DASHBOARD_MEALS = [
  {
    id: 'm1',
    type: 'Breakfast',
    title: 'Berry & Oats',
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=600&auto=format&fit=crop',
    calories: 420,
    time: '15 min',
    tags: ['Pre-Workout']
  },
  {
    id: 'm2',
    type: 'Lunch',
    title: 'Lemon Chicken',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
    calories: 550,
    time: '25 min',
    tags: ['Recovery']
  },
  {
    id: 'm3',
    type: 'Snack',
    title: 'Greek Yogurt',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&auto=format&fit=crop',
    calories: 220,
    time: '5 min',
    tags: ['High Protein']
  },
  {
    id: 'm4',
    type: 'Dinner',
    title: 'Salmon Bowl',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?q=80&w=600&auto=format&fit=crop',
    calories: 600,
    time: '30 min',
    tags: ['Omega-3']
  }
];

interface DashboardProps {
  onNavigate: (view: AppView, params?: any) => void;
  onLogClick?: () => void; 
  onStartWorkout?: (workout?: WorkoutDay) => void;
}

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// Compact Schedule Data
const SCHEDULE = [
  { day: 'M', date: '21', status: 'completed' },
  { day: 'T', date: '22', status: 'completed' },
  { day: 'W', date: '23', status: 'missed' },
  { day: 'T', date: '24', status: 'today' },
  { day: 'F', date: '25', status: 'future' },
  { day: 'S', date: '26', status: 'future' },
  { day: 'S', date: '27', status: 'future' },
];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState('24');
  
  const handleDateClick = (date: string) => {
    onNavigate(AppView.CALENDAR, { initialDate: date });
  };

  const recentExercises = [EXERCISE_DB[1], EXERCISE_DB[0], EXERCISE_DB[3], EXERCISE_DB[2], EXERCISE_DB[4]];

  return (
    <>
      <motion.div 
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="bg-black min-h-screen relative pt-[env(safe-area-inset-top)] pb-32 text-white overflow-x-hidden"
      >
        
        {/* Premium Header */}
        <motion.div 
          variants={itemVariants} 
          className="flex justify-between items-center px-6 pt-6 pb-2 sticky top-0 z-40 bg-gradient-to-b from-black via-black/95 to-transparent"
        >
          <div 
            className="flex items-center gap-4 cursor-pointer group" 
            onClick={() => onNavigate(AppView.PROFILE)}
          >
            <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/5 group-hover:ring-white/20 transition-all">
                    <img 
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" 
                      className="w-full h-full object-cover" 
                      alt="Profile" 
                    />
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#30D158] border-[3px] border-black rounded-full"></div>
            </div>
            
            <div className="flex flex-col justify-center">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Good Morning</div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold font-display text-white leading-none tracking-tight">Alex Runner</span>
                    <div className="bg-[#0A84FF]/20 px-1.5 py-0.5 rounded text-[8px] font-bold text-[#0A84FF] uppercase tracking-wider">PRO</div>
                </div>
            </div>
          </div>

          <div className="flex gap-3">
              <button 
                onClick={() => setIsSearchOpen(true)} 
                className="w-11 h-11 flex items-center justify-center rounded-full bg-[#1C1C1E] border border-white/5 text-zinc-400 hover:text-white hover:bg-[#2C2C2E] transition-all active:scale-95"
              >
                <Search size={20} strokeWidth={2} />
              </button>
              <button 
                onClick={() => setIsNotificationsOpen(true)}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-[#1C1C1E] border border-white/5 text-zinc-400 hover:text-white hover:bg-[#2C2C2E] transition-all relative active:scale-95"
              >
                <Bell size={20} strokeWidth={2} />
                <span className="absolute top-3 right-3.5 w-1.5 h-1.5 bg-[#FF453A] rounded-full ring-2 ring-[#1C1C1E]" />
              </button>
          </div>
        </motion.div>

        {/* Interactive Date Strip */}
        <motion.div variants={itemVariants} className="px-5 mt-4 mb-4">
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
                   
                   <div className={`w-[44px] h-[44px] flex flex-col items-center justify-center rounded-full transition-all relative z-10 ${isSelected ? 'bg-white text-black shadow-lg scale-110' : 'bg-transparent text-zinc-300 hover:bg-white/5'}`}>
                       {isSelected && (
                          <motion.div layoutId="activeDay" className="absolute inset-0 bg-white rounded-full -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                       )}
                       <span className="text-[18px] font-bold font-display leading-none pt-0.5 relative z-10">{day.date}</span>
                       
                       {!isSelected && (isCompleted || isToday) && (
                         <div className={`mt-1.5 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-zinc-700'}`} />
                       )}
                   </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Exercises - Container Padding Layout */}
        <motion.div variants={itemVariants} className="mt-8 mb-4 px-6 flex justify-between items-end">
           <h3 className="text-xl font-bold text-white font-display tracking-tight">Recent Exercises</h3>
           <button onClick={() => onNavigate(AppView.COACH, { tab: 'History' })} className="text-[11px] font-bold text-[#0A84FF] uppercase tracking-wider hover:text-white transition-colors">View All</button>
        </motion.div>
        
        {/* Switched to px-6 on container for cleaner alignment */}
        <motion.div variants={itemVariants} className="flex gap-4 overflow-x-auto px-6 pb-6 no-scrollbar snap-x">
           {recentExercises.map((ex, i) => (
              <motion.div 
                key={ex.id}
                onClick={() => onNavigate(AppView.COACH, { tab: 'Library', exerciseId: ex.id })}
                className="snap-start shrink-0 w-[170px] h-[240px] relative rounded-[32px] overflow-hidden cursor-pointer group active:scale-95 transition-all shadow-lg bg-[#1C1C1E] border border-white/5"
              >
                 <img src={ex.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-90" alt={ex.name} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                 
                 <div className="absolute bottom-5 left-5 right-5">
                    <div className="text-[9px] font-bold text-[#0A84FF] uppercase tracking-widest mb-1.5">{ex.muscle}</div>
                    <div className="text-[16px] font-bold font-display text-white leading-tight">{ex.name}</div>
                 </div>
              </motion.div>
           ))}
        </motion.div>

        {/* Nutrition - Container Padding Layout */}
        <motion.div variants={itemVariants} className="mt-4 mb-4 px-6 flex justify-between items-end">
           <h3 className="text-xl font-bold text-white font-display tracking-tight">Nutrition</h3>
           <button onClick={() => onNavigate(AppView.NUTRITION, { openLibrary: true })} className="text-[11px] font-bold text-[#0A84FF] uppercase tracking-wider hover:text-white transition-colors">View All</button>
        </motion.div>

        {/* Switched to px-6 on container for cleaner alignment */}
        <motion.div variants={itemVariants} className="flex gap-4 overflow-x-auto px-6 pb-8 no-scrollbar snap-x">
           {DASHBOARD_MEALS.map((meal, i) => (
              <motion.div 
                key={meal.id}
                onClick={() => onNavigate(AppView.NUTRITION)}
                className="snap-start shrink-0 w-[260px] h-[260px] bg-[#1C1C1E] rounded-[32px] p-2 active:scale-95 transition-transform cursor-pointer border border-white/5 group flex flex-col"
              >
                 <div className="relative h-[160px] w-full rounded-[24px] overflow-hidden bg-black/20 shrink-0">
                    <img src={meal.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" alt={meal.title} />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 shadow-lg">
                        <span className="text-[10px] font-bold text-white flex items-center gap-1">
                            <Flame size={10} className="text-orange-500 fill-current" /> {meal.calories}
                        </span>
                    </div>
                 </div>
                 
                 <div className="px-3 pt-3 pb-2 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{meal.type}</div>
                        <div className="text-[17px] font-bold font-display text-white leading-tight truncate">{meal.title}</div>
                    </div>
                    <div className="flex gap-2 mt-2">
                        {meal.tags?.map(tag => (
                            <span key={tag} className="text-[9px] font-bold text-zinc-400 bg-white/5 px-2 py-1 rounded-lg border border-white/5">{tag}</span>
                        ))}
                    </div>
                 </div>
              </motion.div>
           ))}
        </motion.div>

      </motion.div>

      <AnimatePresence>
        {isTimerOpen && <TimerModal onClose={() => setIsTimerOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isNotificationsOpen && <NotificationsModal onClose={() => setIsNotificationsOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && <GlobalSearchModal onClose={() => setIsSearchOpen(false)} onNavigate={onNavigate} />}
      </AnimatePresence>
    </>
  );
};
