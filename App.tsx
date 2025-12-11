
import React, { useState } from 'react';
import { Layout } from './components/Layout.tsx';
import { Dashboard } from './views/Dashboard.tsx';
import { Coach } from './views/Coach.tsx';
import { Nutrition } from './views/Nutrition.tsx';
import { Social } from './views/Social.tsx';
import { Progress } from './views/Progress.tsx';
import { Calendar } from './views/Calendar.tsx';
import { Profile } from './views/Profile.tsx';
import { LogWorkout } from './views/LogWorkout.tsx';
import { ActionSheet } from './components/ActionSheet.tsx';
import { AppView, WorkoutDay, ScheduleItem } from './types.ts';
import { AnimatePresence } from 'framer-motion';

// Initial Schedule Data lifted from Calendar
const INITIAL_SCHEDULE_DATA: Record<string, ScheduleItem[]> = {
  '21': [
    { 
      id: 'd3', 
      title: 'Morning Run', 
      subtitle: 'Cardio', 
      duration: '30 min', 
      exercises: [], 
      completed: true, 
      assignedBy: 'USER',
      category: 'WORKOUT',
      date: '21',
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop'
    }
  ],
  '24': [
    { 
      id: 'd1', 
      title: 'Upper Body Strength A', 
      subtitle: 'Hypertrophy Program', 
      typeLabel: 'Hypertrophy', 
      duration: '65 min', 
      timeLeft: '45 min left',
      exercises: [ 
        { id: 'e1', name: 'Barbell Squat', sets: 3, reps: '12', rest: 60, videoThumb: '', lastWeight: '225 lbs' },
        { id: 'e2', name: 'Bench Press', sets: 3, reps: '12', rest: 60, videoThumb: '', lastWeight: '185 lbs' },
        { id: 'e3', name: 'Pull Up', sets: 3, reps: '12', rest: 60, videoThumb: '', lastWeight: 'BW' }
      ], 
      completed: false, 
      assignedBy: 'COACH', 
      coachAssigned: true,
      category: 'WORKOUT',
      date: '24',
      status: 'In Progress',
      currentSet: 'SET 3 OF 5',
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'n1',
      title: 'Power Berry Bowl', 
      subtitle: 'Nutrition • 420 Kcal',
      typeLabel: 'Nutrition',
      duration: '10 min', 
      exercises: [], 
      completed: true, 
      assignedBy: 'COACH',
      category: 'NUTRITION',
      date: '24',
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=800&auto=format&fit=crop',
      mealData: {
        id: 'm1',
        type: 'BREAKFAST',
        title: 'Power Berry &\nOats Bowl',
        description: 'Steel-cut oats topped with fresh blueberries, chia seeds, and a scoop of vanilla whey.',
        coachNote: 'Complex carbs to fuel your morning session. Don\'t skip the chia seeds!',
        image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=800&auto=format&fit=crop',
        calories: 420,
        macros: { p: 4, c: 55, f: 12 },
        prepTime: '10 MIN',
        completed: true,
        tags: ['PRE-WORKOUT', 'HIGH FIBER']
      }
    }
  ],
  '23': [
    { 
      id: 'd2-missed', 
      title: 'Rest Day', 
      subtitle: 'Recovery', 
      typeLabel: 'Recovery',
      duration: '-', 
      timeLeft: '-',
      exercises: [], 
      completed: false, 
      assignedBy: 'COACH',
      category: 'WORKOUT',
      date: '23',
      status: 'Missed',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop'
    }
  ],
  '22': [
    { 
      id: 'd2', 
      title: 'Posterior Chain', 
      subtitle: 'Hypertrophy Program',
      typeLabel: 'Strength', 
      duration: '55 min', 
      exercises: [], 
      completed: true, 
      assignedBy: 'COACH',
      coachAssigned: true,
      category: 'WORKOUT',
      date: '22',
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1603287681836-e174ce7562f2?q=80&w=800&auto=format&fit=crop'
    }
  ],
  '25': [
    { 
      id: 'd25', 
      title: 'Active Recovery', 
      subtitle: 'Mobility',
      typeLabel: 'Mobility', 
      duration: '20 min', 
      exercises: [], 
      completed: false, 
      assignedBy: 'COACH',
      category: 'WORKOUT',
      date: '25',
      status: 'Scheduled',
      image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=800&auto=format&fit=crop'
    }
  ],
  '26': [],
  '27': []
};

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [viewParams, setViewParams] = useState<any>({});
  
  // State for active workout data
  const [activeWorkoutData, setActiveWorkoutData] = useState<WorkoutDay | null>(null);
  
  // Global Schedule State
  const [scheduleData, setScheduleData] = useState<Record<string, ScheduleItem[]>>(INITIAL_SCHEDULE_DATA);

  // State for modals/sheets
  const [isLoggingOpen, setIsLoggingOpen] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const handleNavigate = (view: AppView, params?: any) => {
    setCurrentView(view);
    if (params) setViewParams(params);
  };

  const handleViewChange = (view: AppView) => {
    setCurrentView(view);
    setViewParams({}); // Clear params on main nav switch
  };

  const handleStartSession = (workout?: WorkoutDay) => {
    if (workout) {
      setActiveWorkoutData(workout);
    } else {
      setActiveWorkoutData(null);
    }
    setIsActionSheetOpen(false);
    setIsLoggingOpen(true);
  };

  const handleLogClose = () => {
    setIsLoggingOpen(false);
    setTimeout(() => {
      setActiveWorkoutData(null);
    }, 500);
  };

  const handleAddToSchedule = (date: string, item: ScheduleItem) => {
    // Extract day number for the simple schedule structure we're using (e.g., "2023-10-24" -> "24")
    // In a real app, this would use full date keys.
    const dayKey = date.split('-')[2]; // Assuming YYYY-MM-DD
    
    // Fallback if we just got a day number (for demo robustness)
    const finalKey = dayKey || date;

    setScheduleData(prev => {
      const dayItems = prev[finalKey] || [];
      
      // Check for an existing User-Assigned workout that isn't completed
      // This allows us to merge multiple exercises into one "Custom Session" card
      const existingWorkoutIndex = dayItems.findIndex(i => 
        i.category === 'WORKOUT' && 
        i.assignedBy === 'USER' && 
        i.status !== 'Completed' &&
        i.status !== 'Missed'
      );

      if (existingWorkoutIndex >= 0) {
        // Merge into existing workout
        const updatedItems = [...dayItems];
        const existingWorkout = updatedItems[existingWorkoutIndex];
        
        // Extract new exercises from the incoming item (it likely has 1)
        const newExercises = item.exercises || [];
        
        // Combine
        const mergedExercises = [...(existingWorkout.exercises || []), ...newExercises];
        
        // Update the existing item
        updatedItems[existingWorkoutIndex] = {
          ...existingWorkout,
          title: 'Custom Session',
          subtitle: `${mergedExercises.length} Exercises`,
          exercises: mergedExercises,
          // Keep other props like id, duration etc. or update them
          image: existingWorkout.image || item.image // preserve image
        };
        
        return { ...prev, [finalKey]: updatedItems };
      } else {
        // Create new card
        return {
          ...prev,
          [finalKey]: [...dayItems, { ...item, date: finalKey }]
        };
      }
    });
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <Dashboard 
            onNavigate={handleNavigate} 
            onLogClick={() => setIsActionSheetOpen(true)} 
            onStartWorkout={handleStartSession}
          />
        );
      case AppView.COACH:
        return (
          <Coach 
            initialTab={viewParams?.tab} 
            initialExerciseId={viewParams?.exerciseId}
            onLogClick={() => setIsActionSheetOpen(true)}
            onStartWorkout={handleStartSession}
            onNavigate={handleNavigate}
            onAddToSchedule={handleAddToSchedule}
          />
        );
      case AppView.NUTRITION:
        return (
          <Nutrition 
            initialOpenLibrary={viewParams?.openLibrary}
          />
        );
      case AppView.SOCIAL:
        return (
          <Social 
            onStartWorkout={handleStartSession}
          />
        );
      case AppView.PROGRESS:
        return (
          <Progress 
            onNavigate={handleViewChange} 
            initialMetric={viewParams?.metric}
          />
        );
      case AppView.CALENDAR:
        return (
          <Calendar 
            onNavigate={handleNavigate} 
            initialDate={viewParams?.initialDate} 
            onStartWorkout={handleStartSession}
            scheduleData={scheduleData}
          />
        );
      case AppView.PROFILE:
        return <Profile onNavigate={handleNavigate} />;
      default:
        return (
          <Dashboard 
            onNavigate={handleNavigate} 
            onLogClick={() => setIsActionSheetOpen(true)} 
            onStartWorkout={handleStartSession}
          />
        );
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={handleViewChange}
      onLogClick={() => setIsActionSheetOpen(true)}
    >
      {renderView()}
      
      <ActionSheet 
        isOpen={isActionSheetOpen} 
        onClose={() => setIsActionSheetOpen(false)}
        onManualLog={() => handleStartSession()}
        onNavigate={handleNavigate}
      />

      <AnimatePresence>
        {isLoggingOpen && (
          <LogWorkout 
            key={activeWorkoutData ? activeWorkoutData.id : 'manual-log'}
            onClose={handleLogClose} 
            initialWorkout={activeWorkoutData}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
