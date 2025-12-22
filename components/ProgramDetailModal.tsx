
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, CheckCircle2, Lock, TrendingUp, Play, Zap, Dumbbell, ArrowRight, Info, Calendar } from 'lucide-react';
import { Button } from './ui/Button.tsx';
import { WorkoutDay } from '../types.ts';

interface ProgramDetailModalProps {
  onClose: () => void;
  onSelectDay: (day: WorkoutDay) => void;
}

// Mock Data for the 12-Week Program
const INITIAL_WEEKS = [
  { id: 1, label: 'Week 1', title: 'Accumulation Phase', status: 'completed' },
  { id: 2, label: 'Week 2', title: 'Accumulation Phase', status: 'completed' },
  { id: 3, label: 'Week 3', title: 'Accumulation Phase', status: 'completed' },
  { id: 4, label: 'Week 4', title: 'Deload & Recovery', status: 'current' },
  { id: 5, label: 'Week 5', title: 'Intensification Phase', status: 'locked' },
  { id: 6, label: 'Week 6', title: 'Intensification Phase', status: 'locked' },
  { id: 7, label: 'Week 7', title: 'Intensification Phase', status: 'locked' },
  { id: 8, label: 'Week 8', title: 'Deload', status: 'locked' },
  { id: 9, label: 'Week 9', title: 'Peak Phase', status: 'locked' },
  { id: 10, label: 'Week 10', title: 'Peak Phase', status: 'locked' },
  { id: 11, label: 'Week 11', title: 'Peak Phase', status: 'locked' },
  { id: 12, label: 'Week 12', title: 'Testing Maxes', status: 'locked' },
];

const WEEK_WORKOUTS = [
    { title: 'Day 1: Upper Body Strength', duration: '65 min', type: 'Strength' },
    { title: 'Day 2: Lower Body Squat Focus', duration: '60 min', type: 'Hypertrophy' },
    { title: 'Day 3: Active Recovery', duration: '30 min', type: 'Recovery' },
    { title: 'Day 4: Upper Body Hypertrophy', duration: '55 min', type: 'Hypertrophy' },
    { title: 'Day 5: Lower Body Hinge Focus', duration: '60 min', type: 'Strength' },
    { title: 'Day 6: Arms & Abs', duration: '45 min', type: 'Accessory' },
    { title: 'Day 7: Rest', duration: '-', type: 'Rest' },
];

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({ onClose, onSelectDay }) => {
  const [weeks, setWeeks] = useState(INITIAL_WEEKS);
  const [expandedWeek, setExpandedWeek] = useState<number>(4); // Default to current week
  const [headerOpacity, setHeaderOpacity] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    // Calculate opacity for the sticky header background (0 to 1 over 250px)
    const newOpacity = Math.min(scrollTop / 250, 1);
    setHeaderOpacity(newOpacity);
  };

  const toggleWeekStatus = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setWeeks(prev => prev.map(w => {
        if (w.id === id) {
            // Cycle: Locked -> Current -> Completed -> Locked (for demo interactivity)
            const nextStatus = w.status === 'locked' ? 'current' : w.status === 'current' ? 'completed' : 'locked';
            // If setting to current, ensure it expands
            if (nextStatus === 'current') setExpandedWeek(id);
            return { ...w, status: nextStatus };
        }
        return w;
    }));
  };

  const handleDayClick = (workout: any, weekId: number, dayIndex: number) => {
    const mockDay: WorkoutDay = {
        id: `prog-w${weekId}-d${dayIndex}`,
        title: workout.title.split(': ')[1] || workout.title, 
        subtitle: `${workout.type} • ${workout.duration}`,
        duration: workout.duration,
        completed: weekId < 4,
        exercises: [], 
        assignedBy: 'COACH',
        dayLabel: `Day ${dayIndex}`
    };
    onSelectDay(mockDay);
  };

  const handleResumeCurrentWeek = () => {
    // Identify the active current week
    const currentWeek = weeks.find(w => w.status === 'current') || weeks[3];
    const workoutToResume = WEEK_WORKOUTS[0]; 

    const day: WorkoutDay = {
        id: `prog-w${currentWeek.id}-resume`,
        title: workoutToResume.title.split(': ')[1] || workoutToResume.title,
        subtitle: `${workoutToResume.type} • ${workoutToResume.duration}`,
        duration: workoutToResume.duration,
        completed: false,
        exercises: [], 
        assignedBy: 'COACH',
        dayLabel: `Week ${currentWeek.id} • Day 1`
    };

    onSelectDay(day);
  };

  const activeWeek = weeks.find(w => w.status === 'current') || weeks[3];

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-end md:items-center justify-center pointer-events-none"
    >
      <div className="absolute inset-0 bg-[#000000] bg-opacity-90 backdrop-blur-md pointer-events-auto" onClick={onClose} />
      
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="pointer-events-auto bg-[#000000] w-full md:w-[600px] h-[95vh] md:h-[90vh] rounded-t-[32px] md:rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col border border-white/10"
      >
        {/* Sticky Header Bar */}
        <div 
            className="absolute top-0 left-0 right-0 z-30 px-6 pt-safe-top pb-4 flex justify-between items-center transition-all duration-300 pointer-events-none"
            style={{ 
                backgroundColor: `rgba(0,0,0,${headerOpacity * 0.9})`, 
                backdropFilter: `blur(${headerOpacity * 20}px)`,
                borderBottom: `1px solid rgba(255,255,255,${headerOpacity * 0.1})`
            }}
        >
             <div className="flex items-center gap-2 transition-opacity duration-300" style={{ opacity: headerOpacity }}>
                 <span className="w-8 h-8 rounded-full bg-[#0A84FF] flex items-center justify-center text-white text-[10px] font-bold">HP</span>
                 <span className="font-bold text-white text-sm">Hypertrophy Protocol</span>
             </div>
             
             {/* Spacer if title not visible */}
             <div style={{ opacity: 1 - headerOpacity }} />

             <button 
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-colors pointer-events-auto"
            >
                <X size={18} />
            </button>
        </div>

        {/* Content Container */}
        <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto bg-[#000000] relative"
        >
            {/* Hero Section */}
            <div className="h-[340px] relative w-full overflow-hidden">
                <motion.img 
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop" 
                    className="w-full h-full object-cover" 
                    alt="Program Cover"
                    style={{ 
                        scale: 1 + (1 - Math.max(0, 1 - headerOpacity)) * 0.1,
                        y: (1 - Math.max(0, 1 - headerOpacity)) * 50
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-2 mb-3"
                    >
                        <span className="px-3 py-1 rounded-full bg-[#0A84FF] text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20">
                            Hypertrophy
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingUp size={10} className="text-yellow-500" /> Advanced
                        </span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl font-bold font-display text-white mb-3 leading-[0.95] tracking-tight drop-shadow-lg"
                    >
                        Hypertrophy<br/>Protocol
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-zinc-300 text-sm font-medium line-clamp-2 leading-relaxed max-w-md"
                    >
                        A 12-week periodized program designed to maximize muscle growth through progressive overload and metabolic stress.
                    </motion.p>
                </div>
            </div>

            {/* Main Body */}
            <div className="px-6 pb-32 pt-6">
            
                {/* Progress Card */}
                <div className="bg-[#1C1C1E] p-5 rounded-[24px] border border-white/5 mb-8 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50" />
                    <div className="flex justify-between items-end mb-4 relative z-10">
                        <div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <Zap size={10} className="text-yellow-500" /> Current Progress
                            </div>
                            <div className="text-xl font-bold font-display text-white">
                                {activeWeek.label} <span className="text-zinc-600 text-base">/ 12</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold font-display text-[#0A84FF] tracking-tight tabular-nums">32%</div>
                        </div>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden relative z-10">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '32%' }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-[#0A84FF] rounded-full shadow-[0_0_15px_rgba(10,132,255,0.6)]" 
                        />
                    </div>
                </div>

                {/* Syllabus Header */}
                <div className="flex items-center justify-between mb-4 pl-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <div className="w-1 h-4 bg-[#0A84FF] rounded-full" />
                        Syllabus
                    </h3>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tap icon to toggle status</div>
                </div>

                {/* Weeks List */}
                <div className="space-y-3">
                    {weeks.map((week) => {
                        const isExpanded = expandedWeek === week.id;
                        const isLocked = week.status === 'locked';
                        const isCompleted = week.status === 'completed';
                        const isCurrent = week.status === 'current';

                        return (
                            <motion.div 
                            key={week.id}
                            initial={false}
                            animate={{ 
                                backgroundColor: isCurrent ? '#1C1C1E' : '#111111',
                                borderColor: isCurrent ? 'rgba(10,132,255,0.3)' : 'rgba(255,255,255,0.05)'
                            }}
                            className={`rounded-[24px] border overflow-hidden transition-all duration-300 ${isCurrent ? 'ring-1 ring-blue-500/20 shadow-lg' : ''}`}
                            >
                            <div 
                                className={`w-full p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors`}
                                onClick={() => setExpandedWeek(isExpanded ? 0 : week.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={(e) => toggleWeekStatus(week.id, e)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all active:scale-90 hover:scale-105 ${
                                            isCompleted ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                            isCurrent ? 'bg-[#0A84FF] text-white border-[#0A84FF] shadow-lg shadow-blue-500/30' :
                                            'bg-black border-white/10 text-zinc-600 hover:border-white/20'
                                        }`}
                                    >
                                        {isCompleted ? <CheckCircle2 size={18} /> : isLocked ? <Lock size={16} /> : <span className="font-bold text-sm">{week.id}</span>}
                                    </button>
                                    <div className="text-left">
                                        <div className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isCurrent ? 'text-blue-400' : 'text-zinc-500'}`}>
                                        {week.label}
                                        </div>
                                        <div className={`text-base font-bold font-display tracking-tight ${isLocked ? 'text-zinc-600' : 'text-white'}`}>{week.title}</div>
                                    </div>
                                </div>
                                {!isLocked && (
                                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-zinc-500`}>
                                        <ChevronDown size={20} />
                                    </div>
                                )}
                            </div>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 pt-0 space-y-2">
                                        <div className="h-px bg-white/5 w-full mb-3 mx-auto" />
                                        {WEEK_WORKOUTS.map((workout, idx) => (
                                            <div 
                                                key={idx}
                                                onClick={() => workout.type !== 'Rest' && handleDayClick(workout, week.id, idx + 1)}
                                                className={`p-3 rounded-[16px] flex items-center justify-between group transition-all border border-transparent ${
                                                    workout.type === 'Rest' 
                                                    ? 'opacity-50 cursor-default' 
                                                    : 'hover:bg-white/5 cursor-pointer hover:border-white/5 active:scale-[0.98]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                                        workout.type === 'Rest' ? 'bg-white/5 text-zinc-600' : 'bg-[#2C2C2E] text-zinc-400 group-hover:bg-[#0A84FF] group-hover:text-white'
                                                    }`}>
                                                    {workout.type === 'Rest' ? <Zap size={14} /> : <Dumbbell size={14} />}
                                                    </div>
                                                    <div>
                                                    <div className="text-[14px] font-bold text-zinc-200 group-hover:text-white transition-colors">
                                                        {workout.title.split(': ')[0]}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">
                                                        {workout.title.split(': ')[1]}
                                                    </div>
                                                    </div>
                                                </div>
                                                {workout.type !== 'Rest' && (
                                                    <div className="flex items-center gap-3">
                                                        <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-zinc-600 hover:text-white transition-colors">
                                                            <Info size={16} />
                                                        </button>
                                                        <div className="text-zinc-600 group-hover:text-white transition-colors">
                                                            <Play size={14} className="fill-current" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Floating Footer Action */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent pt-12 safe-area-bottom pointer-events-none">
           <Button 
             className="w-full bg-white text-black hover:bg-zinc-200 h-16 rounded-[24px] text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-transform active:scale-[0.98] pointer-events-auto" 
             onClick={handleResumeCurrentWeek}
           >
              <div className="flex items-center gap-2">
                 {activeWeek.status === 'completed' ? 'Review Completed Week' : `Resume ${activeWeek.label}`} <ArrowRight size={20} />
              </div>
           </Button>
        </div>

      </motion.div>
    </motion.div>,
    document.body
  );
};

export default ProgramDetailModal;
