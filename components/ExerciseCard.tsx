import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import {
  Play,
  Image as ImageIcon,
  Video,
  Dumbbell,
  Zap,
  Clock,
  Flame,
  Check,
  ChevronRight,
  Star,
  Heart,
  AlertCircle,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';
import { Exercise } from '../data/exercises.ts';
import { ExerciseWithSource } from '../types/exercise.ts';
import { isFeatureEnabled } from '../services/featureFlags';

// Exercise card props interface
export interface ExerciseCardProps {
  exercise: Exercise | ExerciseWithSource;
  variant?: 'grid' | 'list' | 'minimal' | 'selection';
  selected?: boolean;
  onSelect?: (exercise: Exercise | ExerciseWithSource) => void;
  onMultiSelectToggle?: (exerciseId: string, selected: boolean) => void;
  multiSelect?: boolean;
  isLoading?: boolean;
  showQualityIndicator?: boolean;
  showDataSource?: boolean;
  lazy?: boolean;
  priority?: 'high' | 'low';
  onClick?: (exercise: Exercise | ExerciseWithSource) => void;
  className?: string;
  animationDelay?: number;
  testId?: string;
  onKeyDown?: (event: React.KeyboardEvent, exercise: Exercise | ExerciseWithSource) => void;
  tabIndex?: number;
}

// View mode configurations
const VIEW_MODES = {
  grid: {
    container: 'aspect-square w-full',
    imageContainer: 'h-32',
    contentPadding: 'p-3',
    titleSize: 'text-sm',
    descriptionSize: 'text-xs'
  },
  list: {
    container: 'w-full h-24',
    imageContainer: 'h-24 w-24',
    contentPadding: 'p-4',
    titleSize: 'text-base',
    descriptionSize: 'text-sm'
  },
  minimal: {
    container: 'w-full h-auto',
    imageContainer: 'h-16 w-16',
    contentPadding: 'p-2',
    titleSize: 'text-sm',
    descriptionSize: 'text-xs'
  },
  selection: {
    container: 'w-full h-20',
    imageContainer: 'h-16 w-16',
    contentPadding: 'p-3',
    titleSize: 'text-sm',
    descriptionSize: 'text-xs'
  }
} as const;

// Quality level colors
const QUALITY_COLORS = {
  high: 'bg-green-500/20 border-green-500/30 text-green-400',
  medium: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  low: 'bg-red-500/20 border-red-500/30 text-red-400'
} as const;

// Difficulty level colors
const DIFFICULTY_COLORS = {
  Beginner: 'bg-blue-500/20 text-blue-400',
  Intermediate: 'bg-orange-500/20 text-orange-400',
  Advanced: 'bg-red-500/20 text-red-400'
} as const;

// Muscle group colors
const MUSCLE_COLORS = {
  'Chest': 'bg-blue-500/20 text-blue-300',
  'Back': 'bg-purple-500/20 text-purple-300',
  'Legs': 'bg-green-500/20 text-green-300',
  'Shoulders': 'bg-yellow-500/20 text-yellow-300',
  'Arms': 'bg-red-500/20 text-red-300',
  'Core': 'bg-cyan-500/20 text-cyan-300',
  'Cardio': 'bg-pink-500/20 text-pink-300'
} as const;

// Utility functions
const getYouTubeId = (url?: string): string | null => {
  if (!url) return null;
  const raw = url.trim();
  if (!raw) return null;

  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;

  try {
    const u = new URL(raw, 'https://example.com');
    const v = u.searchParams.get('v');
    if (v && v.length >= 8) return v.substring(0, 11);

    const pathMatch = u.pathname.match(/\/(?:shorts|live|embed|v)\/([A-Za-z0-9_-]{7,})(?:[?&\/]|$)/i);
    if (pathMatch?.[1]) return pathMatch[1].length > 11 ? pathMatch[1].slice(0, 11) : pathMatch[1];

    if (u.hostname.toLowerCase().includes('youtu.be')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return id.length > 11 ? id.slice(0, 11) : id;
    }
  } catch (e) {
    // Fall through to regex
  }

  try {
    const re = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{7,})(?:[?&\/]|$)/i;
    const m = String(raw).match(re);
    if (m && m[1]) {
      return m[1].length > 11 ? m[1].slice(0, 11) : m[1];
    }
  } catch (e) {
    // ignore
  }

  return null;
};

const getQualityLevel = (exercise: Exercise | ExerciseWithSource) => {
  const hasVideo = !!(exercise as ExerciseWithSource).video || getYouTubeId(exercise.video);
  const hasImage = !!exercise.image;
  const hasInstructions = exercise.steps && exercise.steps.length > 0;
  const hasBenefits = exercise.benefits && exercise.benefits.length > 0;
  const hasOverview = !!exercise.overview;

  const score = [hasVideo, hasImage, hasInstructions, hasBenefits, hasOverview].filter(Boolean).length;

  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
};

const getFallbackImage = (exerciseName: string): string => {
  const fallbackImages = [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400&auto=format&fit=crop'
  ];

  const hash = exerciseName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbackImages[hash % fallbackImages.length];
};

// Lazy image component
const LazyImage = memo<{
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}>(({ src, alt, className, onLoad, onError }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-zinc-800 ${className}`}>
        <ImageIcon size={24} className="text-zinc-600" />
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
          <Loader2 size={20} className="text-zinc-600 animate-spin" />
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
});

// Skeleton loader component
const ExerciseCardSkeleton = ({ variant = 'grid' }: { variant?: ExerciseCardProps['variant'] }) => {
  const mode = VIEW_MODES[variant || 'grid'];

  if (variant === 'list') {
    return (
      <div className={`bg-zinc-900/50 border border-white/5 rounded-xl ${mode.container} animate-pulse`}>
        <div className="flex h-full">
          <div className={`${mode.imageContainer} bg-zinc-800 rounded-l-xl`} />
          <div className={`flex-1 ${mode.contentPadding} flex flex-col justify-between`}>
            <div>
              <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
              <div className="h-3 bg-zinc-800 rounded w-1/2 mb-2" />
              <div className="h-3 bg-zinc-800 rounded w-1/3" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 bg-zinc-800 rounded-full w-16" />
              <div className="h-6 bg-zinc-800 rounded-full w-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-900/50 border border-white/5 rounded-xl ${mode.container} animate-pulse`}>
      <div className={`${mode.imageContainer} bg-zinc-800 rounded-t-xl`} />
      <div className={`${mode.contentPadding}`}>
        <div className="h-4 bg-zinc-800 rounded w-full mb-2" />
        <div className="h-3 bg-zinc-800 rounded w-2/3 mb-3" />
        <div className="flex gap-2">
          <div className="h-5 bg-zinc-800 rounded-full w-12" />
          <div className="h-5 bg-zinc-800 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
};

// Main ExerciseCard component
export const ExerciseCard = memo<ExerciseCardProps>(({
  exercise,
  variant = 'grid',
  selected = false,
  onSelect,
  onMultiSelectToggle,
  multiSelect = false,
  isLoading = false,
  showQualityIndicator = true,
  showDataSource = false,
  lazy = true,
  priority = 'low',
  onClick,
  className = '',
  animationDelay = 0,
  testId,
  onKeyDown,
  tabIndex = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const mode = VIEW_MODES[variant];
  const qualityLevel = getQualityLevel(exercise);
  const youtubeId = getYouTubeId(exercise.video);
  const hasVideo = !!youtubeId || !!exercise.video;
  const isExerciseWithSource = (ex: any): ex is ExerciseWithSource => 'dataSource' in ex;
  const exerciseWithSource = isExerciseWithSource(exercise) ? exercise : null;

  const exerciseImage = exercise.image || getFallbackImage(exercise.name);
  const qualityColor = QUALITY_COLORS[qualityLevel];
  const difficultyColor = DIFFICULTY_COLORS[exercise.difficulty];
  const muscleColor = MUSCLE_COLORS[exercise.muscle as keyof typeof MUSCLE_COLORS] || 'bg-zinc-500/20 text-zinc-300';

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (multiSelect && onMultiSelectToggle) {
      onMultiSelectToggle(exercise.id, !selected);
    } else if (onClick) {
      onClick(exercise);
    } else if (onSelect) {
      onSelect(exercise);
    }
  }, [multiSelect, onMultiSelectToggle, selected, onClick, onSelect, exercise]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as any);
    }
    onKeyDown?.(e, exercise);
  }, [handleClick, onKeyDown, exercise]);

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: animationDelay,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  if (isLoading) {
    return <ExerciseCardSkeleton variant={variant} />;
  }

  const isList = variant === 'list';
  const isMinimal = variant === 'minimal';

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      className={`
        relative bg-zinc-900/80 border border-white/5 rounded-xl
        backdrop-blur-sm overflow-hidden cursor-pointer
        transition-all duration-200 hover:border-white/10 hover:bg-zinc-900/90
        focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/50
        ${selected ? 'ring-2 ring-[#0A84FF] ring-offset-2 ring-offset-zinc-900' : ''}
        ${mode.container}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={tabIndex}
      role="button"
      aria-label={`Exercise: ${exercise.name}. Target muscle: ${exercise.muscle}. Equipment: ${exercise.equipment}. Difficulty: ${exercise.difficulty}. ${hasVideo ? 'Has video demonstration.' : 'No video available.'}`}
      data-testid={testId || `exercise-card-${exercise.id}`}
      data-variant={variant}
      data-selected={selected}
      data-muscle={exercise.muscle}
      data-difficulty={exercise.difficulty}
      data-equipment={exercise.equipment}
      data-has-video={hasVideo}
    >
      {/* Multi-select checkbox */}
      {multiSelect && (
        <div className="absolute top-2 left-2 z-20">
          <motion.div
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
              selected
                ? 'bg-[#0A84FF] border-[#0A84FF]'
                : 'border-white/20 bg-black/40 backdrop-blur-sm'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {selected && <Check size={14} className="text-white" />}
          </motion.div>
        </div>
      )}

      {/* Quality indicator */}
      {showQualityIndicator && !isMinimal && (
        <div className="absolute top-2 right-2 z-20">
          <div className={`px-2 py-1 rounded-full text-[10px] font-medium border ${qualityColor} backdrop-blur-sm`}>
            {qualityLevel === 'high' && 'Complete'}
            {qualityLevel === 'medium' && 'Partial'}
            {qualityLevel === 'low' && 'Limited'}
          </div>
        </div>
      )}

      {/* Data source indicator (development only) */}
      {showDataSource && exerciseWithSource && isFeatureEnabled('SHOW_DATA_SOURCE_INDICATORS', false) && !isMinimal && (
        <div className="absolute bottom-2 right-2 z-20">
          <div className={`px-2 py-1 rounded-full text-[10px] font-medium border backdrop-blur-sm ${
            exerciseWithSource.dataSource === 'frontend'
              ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
              : exerciseWithSource.isOriginal
              ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
              : 'bg-green-500/20 border-green-500/30 text-green-400'
          }`}>
            {exerciseWithSource.isOriginal ? 'ORIGINAL' : exerciseWithSource.dataSource.toUpperCase()}
          </div>
        </div>
      )}

      <div className={`flex ${isList ? 'h-full' : 'flex-col'}`}>
        {/* Image/Video section */}
        <div className={`relative ${mode.imageContainer} ${!isList ? 'rounded-t-xl' : 'rounded-l-xl'} overflow-hidden bg-zinc-800`}>
          {lazy ? (
            <LazyImage
              src={imageError ? getFallbackImage(exercise.name) : exerciseImage}
              alt={exercise.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <img
              src={imageError ? getFallbackImage(exercise.name) : exerciseImage}
              alt={exercise.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          )}

          {/* Video indicator overlay */}
          <AnimatePresence>
            {hasVideo && isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center"
                >
                  <Play size={20} className="text-white fill-current ml-1" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video icon badge */}
          {hasVideo && !isMinimal && (
            <div className="absolute bottom-2 left-2">
              <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                {youtubeId ? <Video size={12} className="text-red-500" /> : <Play size={12} className="text-white" />}
              </div>
            </div>
          )}
        </div>

        {/* Content section */}
        <div className={`flex-1 ${mode.contentPadding} ${isList ? 'flex flex-col justify-between' : ''}`}>
          {!isMinimal && (
            <div className="flex items-start justify-between mb-2">
              <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${muscleColor}`}>
                {exercise.muscle}
              </span>
              {exercise.calories > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <Flame size={10} />
                  <span>{exercise.calories}</span>
                </div>
              )}
            </div>
          )}

          <h3 className={`${mode.titleSize} font-bold text-white mb-1 line-clamp-2 leading-tight`}>
            {exercise.name}
          </h3>

          {!isMinimal && (
            <p className={`${mode.descriptionSize} text-zinc-400 mb-3 line-clamp-2`}>
              {exercise.overview || exercise.description || ''}
            </p>
          )}

          {/* Tags and metadata */}
          <div className={`flex items-center gap-2 ${isList ? 'mt-auto' : ''}`}>
            <span className={`px-2 py-1 rounded text-[10px] font-medium ${difficultyColor}`}>
              {exercise.difficulty}
            </span>

            <div className="flex items-center gap-1 text-[10px] text-zinc-400">
              <Dumbbell size={10} />
              <span>{exercise.equipment}</span>
            </div>

            {exercise.bpm > 0 && !isMinimal && (
              <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                <Heart size={10} />
                <span>{exercise.bpm} BPM</span>
              </div>
            )}
          </div>
        </div>

        {/* Selection indicator arrow */}
        {!multiSelect && !isMinimal && (
          <div className={`absolute ${isList ? 'right-4 top-1/2 -translate-y-1/2' : 'bottom-3 right-3'}`}>
            <ChevronRight
              size={16}
              className={`text-zinc-400 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`}
            />
          </div>
        )}
      </div>

      {/* Accessibility announcement for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {selected && 'Selected'}
      </div>
    </motion.div>
  );
});

ExerciseCard.displayName = 'ExerciseCard';

export default ExerciseCard;