

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  COACH = 'COACH',
  NUTRITION = 'NUTRITION',
  SOCIAL = 'SOCIAL',
  PROGRESS = 'PROGRESS',
  CALENDAR = 'CALENDAR',
  PROFILE = 'PROFILE',
  VISION = 'VISION'
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT_2_3 = '2:3',
  LANDSCAPE_3_2 = '3:2',
  PORTRAIT_3_4 = '3:4',
  LANDSCAPE_4_3 = '4:3',
  PORTRAIT_9_16 = '9:16',
  LANDSCAPE_16_9 = '16:9',
  CINEMATIC_21_9 = '21:9'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
  isThinking?: boolean;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  ratio: AspectRatio;
}

export interface ExerciseSet {
  id: string;
  weight: string;
  reps: string;
  rpe: string;
  completed: boolean;
  type?: 'warmup' | 'working' | 'drop';
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: string[]; // IDs or names
}

export interface ProgressMetric {
  date: string;
  value: number;
}

export interface Exercise { 
  id: string; 
  name: string; 
  sets: number; 
  reps: string; 
  rpe?: number; 
  rest: number; 
  videoThumb: string; 
  lastWeight?: string; 
  libraryId?: string; 
}

export interface WorkoutDay { 
  id: string; 
  title: string; 
  subtitle: string; 
  duration: string; 
  exercises: Exercise[]; 
  completed: boolean;
  date?: string; // e.g. "2023-10-24"
  dayLabel?: string; // e.g. "Mon"
  assignedBy?: 'COACH' | 'USER'; 
}

export interface Meal {
  id: string;
  type: string;
  title: string;
  description: string;
  coachNote?: string;
  image: string;
  calories: number;
  macros: { p: number; c: number; f: number };
  prepTime: string;
  completed: boolean;
  tags?: string[];
}

export interface ScheduleItem extends WorkoutDay {
  category?: 'WORKOUT' | 'NUTRITION';
  image?: string;
  status?: 'In Progress' | 'Completed' | 'Missed' | 'Scheduled';
  currentSet?: string;
  typeLabel?: string;
  timeLeft?: string;
  coachAssigned?: boolean;
  mealData?: Meal; 
}
