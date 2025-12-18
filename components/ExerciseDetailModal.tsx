
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, ChevronLeft, ChevronRight, Calendar, Dumbbell, Layers, Maximize2, Minimize2, Zap, Film, AlertCircle, Database } from 'lucide-react';
import { Exercise } from '../data/exercises.ts';
import { ExerciseWithSource } from '../types/exercise.ts';
import { isFeatureEnabled } from '../services/featureFlags';
import { Button } from './ui/Button.tsx';

interface ExerciseDetailModalProps {
  exercise: Exercise | ExerciseWithSource;
  onClose: () => void;
  onAddToWorkout?: (action?: 'SCHEDULE' | 'START', date?: string) => void;
  autoPlay?: boolean;
}

// Helper: robustly detect YouTube video ID from common YouTube URL formats
function getYouTubeId(url?: string): string | null {
    if (!url) return null;
    const raw = url.trim();
    if (!raw) return null;

    // Support passing a raw YouTube video id directly.
    if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
    try {
        // First try query param `v`
        const u = new URL(raw, 'https://example.com');
        const v = u.searchParams.get('v');
        if (v && v.length >= 8) return v.substring(0, 11);

        // Support common path-based formats like /shorts/<id>, /live/<id>, /embed/<id>, /v/<id>, and youtu.be/<id>
        const pathMatch = u.pathname.match(/\/(?:shorts|live|embed|v)\/([A-Za-z0-9_-]{7,})(?:[?&\/]|$)/i);
        if (pathMatch?.[1]) return pathMatch[1].length > 11 ? pathMatch[1].slice(0, 11) : pathMatch[1];
        if (u.hostname.toLowerCase().includes('youtu.be')) {
            const id = u.pathname.split('/').filter(Boolean)[0];
            if (id) return id.length > 11 ? id.slice(0, 11) : id;
        }
    } catch (e) {
        // fall through to regex
    }

    try {
        // regex to catch many patterns (watch?v=, youtu.be/, embed/, /v/, shortlinks, extra params)
        const re = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{7,})(?:[?&\/]|$)/i;
        const m = String(raw).match(re);
        if (m && m[1]) {
            return m[1].length > 11 ? m[1].slice(0, 11) : m[1];
        }
    } catch (e) {
        // ignore
    }

    return null;
}

// Extract a first-found YouTube URL from free text (overview/description)
function extractYouTubeUrlFromText(text?: string): string | undefined {
    if (!text) return undefined;

    // Match common YouTube URL formats (with or without protocol), stopping at whitespace/quotes.
    const match = text.match(/\b(?:https?:\/\/)?(?:[\w-]+\.)*(?:youtube(?:-nocookie)?\.com|youtu\.be)\/[^\s<>"']+/i);
    if (!match?.[0]) return undefined;

    let url = match[0].replace(/[)\]}>.,!?]+$/, '');
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    return url;
}

// Utility function to check if exercise has missing critical data
function hasMissingData(exercise: Exercise | ExerciseWithSource): { hasMissing: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  if (!exercise.video) missingFields.push('video');
  if (!exercise.steps || exercise.steps.length === 0) missingFields.push('steps');
  if (!exercise.benefits || exercise.benefits.length === 0) missingFields.push('benefits');
  if (!exercise.image) missingFields.push('image');
  if (!exercise.overview) missingFields.push('overview');

  return {
    hasMissing: missingFields.length > 0,
    missingFields
  };
}

// Component to show missing data warning
const MissingDataWarning = ({ missingFields }: { missingFields: string[] }) => {
  if (missingFields.length === 0) return null;

  return (
    <div className="mx-5 mt-4 p-3 rounded-[12px] bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
      <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-yellow-400 text-xs font-medium mb-1">Limited Data Available</p>
        <p className="text-zinc-400 text-[10px]">
          This exercise is missing: {missingFields.join(', ').toLowerCase()}
        </p>
      </div>
    </div>
  );
};

// Fallback image for exercises without images
const getFallbackImage = (exerciseName: string): string => {
  // Use unsplash fitness images as fallbacks
  const fallbackImages = [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop'
  ];

  // Use a simple hash to select a consistent fallback image
  const hash = exerciseName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbackImages[hash % fallbackImages.length];
};

// Component for data source indicator (development only)
const DataSourceIndicator = ({ exercise }: { exercise: ExerciseWithSource }) => {
  const showDataIndicators = isFeatureEnabled('SHOW_DATA_SOURCE_INDICATORS', false);
  if (!showDataIndicators) return null;

  const isFrontend = exercise.dataSource === 'frontend';
  const isOriginal = exercise.isOriginal;

  return (
    <div className="mx-5 mt-4 flex items-center gap-2">
      <div className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-medium bg-black/50 border border-white/10">
        {isOriginal ? (
          <>
            <Zap size={10} className="text-yellow-400" />
            <span className="text-yellow-400">ORIGINAL</span>
          </>
        ) : isFrontend ? (
          <>
            <Database size={10} className="text-blue-400" />
            <span className="text-blue-400">FRONTEND</span>
          </>
        ) : (
          <>
            <Database size={10} className="text-green-400" />
            <span className="text-green-400">BACKEND</span>
          </>
        )}
      </div>
      {exercise.quality && (
        <div className="text-[10px] text-zinc-500">
          {exercise.quality.completeness}% complete
        </div>
      )}
    </div>
  );
};

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise, onClose, onAddToWorkout, autoPlay
}) => {
  // Check for missing data
  const { hasMissing, missingFields } = hasMissingData(exercise);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(true);
    const [videoError, setVideoError] = useState(false);

    // YouTube iframe diagnostic and control state
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [iframeReady, setIframeReady] = useState(false);
    const [iframeState, setIframeState] = useState<number | null>(null);
    const [iframeTimeout, setIframeTimeout] = useState(false);
    const [iframePlaybackBlocked, setIframePlaybackBlocked] = useState(false);
    const [showDebug, setShowDebug] = useState<boolean>(() => !!(typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('video-debug')));
    const iframeTimeoutRef = useRef<number | null>(null);
    const iframeOpenFallbackRef = useRef<number | null>(null);

    // iframe src control and remount key - helps force a fresh player when attempting autoplay fallbacks
    const [iframeSrc, setIframeSrc] = useState<string | null>(null);
    const [iframeKey, setIframeKey] = useState<number>(0);
  
  // Scheduling State
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Calendar Navigation State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const progressBarRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoPlayRef = useRef<boolean>(false);

  // Compute an effective video URL (explicit video first, then try to extract YouTube links from text)
  const extractedFromOverview = extractYouTubeUrlFromText(exercise.overview);
  const extractedFromDescription = extractYouTubeUrlFromText(exercise.description);
  const explicitVideo = typeof exercise.video === 'string' ? exercise.video.trim() : '';
  const effectiveVideoUrl = explicitVideo || extractedFromOverview || extractedFromDescription;
  const ytId = getYouTubeId(effectiveVideoUrl);

  // Get fallback image for when exercise.image is missing
  const exerciseImage = exercise.image || getFallbackImage(exercise.name);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  // Keep iframe/player state in sync: when isPlaying changes, send play/pause to YouTube iframe
  useEffect(() => {
    if (iframeRef.current) {
      if (isPlaying) postYouTubeCommand('playVideo');
      else postYouTubeCommand('pauseVideo');
    }
  }, [isPlaying]);

  // Listen for messages from the YouTube iframe (onReady, onStateChange)
  useEffect(() => {
    const allowedOrigins = new Set([
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com'
    ]);

    const onMessage = (ev: MessageEvent) => {
      // Validate origin: accept messages from YouTube origins or from the current iframe src origin
      try {
        const origin = ev.origin;
        const iframeSrc = iframeRef.current?.src;
        const iframeOrigin = iframeSrc ? new URL(iframeSrc).origin : null;
        if (origin && iframeOrigin && origin !== iframeOrigin && !allowedOrigins.has(origin)) {
          return; // ignore unrelated messages
        }
        if (origin && !iframeOrigin && !allowedOrigins.has(origin)) {
          return;
        }
      } catch (e) {
        // If anything goes wrong parsing origins, fall back to strict behavior and continue parsing payload
      }

      let data: any = ev.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch { /* ignore */ }
      }
      if (!data || typeof data !== 'object') return;

      if (data.event === 'onReady') {
        setIframeReady(true);
        setIframeTimeout(false);
        if (iframeTimeoutRef.current) { window.clearTimeout(iframeTimeoutRef.current); iframeTimeoutRef.current = null; }
        if (iframeOpenFallbackRef.current) { window.clearTimeout(iframeOpenFallbackRef.current); iframeOpenFallbackRef.current = null; }
        // Helpful debug log for automated tests
        try { if (typeof navigator !== 'undefined' && (navigator as any).webdriver) console.log('YT:onReady'); } catch {}
      }

      if (data.event === 'onStateChange') {
        const info = 'info' in data ? data.info : (data.data ?? null);
        setIframeState(typeof info === 'number' ? info : null);
        // Helpful debug log for automated tests
        try { if (typeof navigator !== 'undefined' && (navigator as any).webdriver) console.log(`YT:onStateChange: ${info}`); } catch {}
        if (info === 1) { // playing
          setIframeTimeout(false);
          if (iframeTimeoutRef.current) { window.clearTimeout(iframeTimeoutRef.current); iframeTimeoutRef.current = null; }
          if (iframeOpenFallbackRef.current) { window.clearTimeout(iframeOpenFallbackRef.current); iframeOpenFallbackRef.current = null; }
        }
      }
    };

    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      if (iframeTimeoutRef.current) { window.clearTimeout(iframeTimeoutRef.current); iframeTimeoutRef.current = null; }
    };
  }, []);

  // On unmount, ensure media is paused so playback doesn't continue in background
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        try { videoRef.current.pause(); } catch {}
      }
      if (iframeRef.current) {
        postYouTubeCommand('pauseVideo');
      }
      if (iframeTimeoutRef.current) {
        window.clearTimeout(iframeTimeoutRef.current);
        iframeTimeoutRef.current = null;
      }
    };
  }, []);

  // If the iframe times out (didn't report ready), attempt a muted-autoplay fallback by remounting the iframe with autoplay and mute params
  useEffect(() => {
    if (iframeTimeout) {
      const yt = getYouTubeId(effectiveVideoUrl);
      if (!yt) return;
      const fallbackSrc = `https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&autoplay=1&mute=1`;
      // Use state to set the src and bump the key to force remount
      setIframeSrc(fallbackSrc);
      setIframeKey(k => k + 1);

      // clear the timeout flag after attempting the fallback to avoid repeated reloads
      setTimeout(() => setIframeTimeout(false), 3000);
    }
  }, [iframeTimeout, effectiveVideoUrl]);

  // Attempt to trigger playback once when the modal is opened via a direct click from the library.
  // This may fall back to the modal's existing muted-autoplay reload logic if the browser blocks autoplay.
  useEffect(() => {
    if (autoPlay && !autoPlayRef.current) {
      autoPlayRef.current = true;
      try {
        // Call togglePlay immediately to keep the action within the user gesture where possible
        togglePlay();
      } catch (e) {
        // ignore any errors from attempting to play
      }
    }
  }, [autoPlay]);

  // Keep an iframe src state in sync with the effective video url (init and when it changes)
  useEffect(() => {
    const yt = getYouTubeId(effectiveVideoUrl);
    if (yt) {
      const initialSrc = `https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
      setIframeSrc(initialSrc);
      setIframeKey(0);
    } else {
      setIframeSrc(null);
      setIframeKey(0);
    }
  }, [effectiveVideoUrl]);

  useEffect(() => {
    if (videoRef.current) {
        if (isPlaying) {
            videoRef.current.play().catch(e => console.log('Autoplay prevented', e));
        } else {
            videoRef.current.pause();
        }
    }
  }, [isPlaying]);

  // Debug: Add iframe dimension logging
  useEffect(() => {
    if (iframeRef.current) {
      const rect = iframeRef.current.getBoundingClientRect();
      console.log('🎥 Iframe dimensions:', {
        width: rect.width,
        height: rect.height,
        clientWidth: iframeRef.current.clientWidth,
        clientHeight: iframeRef.current.clientHeight,
        offsetWidth: iframeRef.current.offsetWidth,
        offsetHeight: iframeRef.current.offsetHeight
      });
    }
  }, [iframeLoaded, isPlaying]);

  // Debug: Add container dimension logging
  useEffect(() => {
    if (videoContainerRef.current) {
      const rect = videoContainerRef.current.getBoundingClientRect();
      console.log('📺 Video container dimensions:', {
        width: rect.width,
        height: rect.height,
        clientWidth: videoContainerRef.current.clientWidth,
        clientHeight: videoContainerRef.current.clientHeight,
        offsetWidth: videoContainerRef.current.offsetWidth,
        offsetHeight: videoContainerRef.current.offsetHeight,
        computedHeight: getComputedStyle(videoContainerRef.current).height
      });
    }
  }, []);

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

  const postYouTubeCommand = (cmd: string, args: any[] = []) => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      try {
        // YouTube iframe API requires wildcard origin for cross-origin messaging
        // The specific origin validation is handled by YouTube's internal message listener
        const message = JSON.stringify({ event: 'command', func: cmd, args });
        win.postMessage(message, '*');
      } catch (e) {
        // ignore postMessage errors
        console.log('postMessage error:', e);
      }
  };

  const togglePlay = (e?: React.MouseEvent) => {
      e?.stopPropagation();

      // If native video is mounted, control it directly as a user gesture to avoid autoplay blocks
      if (videoRef.current) {
          if (isPlaying) {
              videoRef.current.pause();
              setIsPlaying(false);
          } else {
              // If running under automation (Playwright / WebDriver), pre-mute to allow autoplay.
              const isAutomation = typeof navigator !== 'undefined' && (navigator as any).webdriver;
              if (isAutomation) videoRef.current.muted = true;
              // Try to play; if blocked, retry after muting (common in headless/browser policies)
              videoRef.current.play().then(() => {
                  setIsPlaying(true);
              }).catch(async () => {
                  try {
                      videoRef.current!.muted = true;
                      await videoRef.current!.play();
                      setIsPlaying(true);
                  } catch (e) {
                      // still failed — set state optimistically
                      setIsPlaying(true);
                  }
              });
          }
          return;
      }

      // If an iframe-embedded YouTube is present, send play/pause via postMessage (keeps it inside user gesture)
      if (iframeRef.current) {
          if (isPlaying) {
              postYouTubeCommand('pauseVideo');
              setIsPlaying(false);
          } else {
              // If iframe hasn't signaled it's ready, set a timeout to mark it as timed out
                if (!iframeReady) {
                    // Immediately attempt an autoplay+mute reload to satisfy browsers that require
                    // a user-gesture-initiated navigation for autoplay on cross-origin iframes.
                    try {
                      const yt = getYouTubeId(effectiveVideoUrl);
                      if (yt) {
                        const fallbackSrc = `https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&autoplay=1&mute=1`;
                        // Use state to set the new src and bump the remount key so the browser treats it as a fresh navigation
                        setIframeSrc(fallbackSrc);
                        setIframeKey(k => k + 1);
                        setIframeLoaded(true);
                        setIframeTimeout(false);
                        if (iframeTimeoutRef.current) { window.clearTimeout(iframeTimeoutRef.current); iframeTimeoutRef.current = null; }
                        setIsPlaying(true);

                        // After a short delay, attempt to send a play command in case the new player is ready fast
                        setTimeout(() => {
                          try { postYouTubeCommand('playVideo'); postYouTubeCommand('unMute'); } catch (e) {}
                        }, 300);

                        // Schedule a backup to show a blocked playback UI (do NOT open external pages automatically)
                        if (typeof window !== 'undefined') {
                          if (iframeOpenFallbackRef.current) { window.clearTimeout(iframeOpenFallbackRef.current); iframeOpenFallbackRef.current = null; }
                          iframeOpenFallbackRef.current = window.setTimeout(() => {
                            if (!iframeReady && iframeState !== 1) {
                              // Instead of auto-opening YouTube, surface a user-facing blocked playback UI and keep the user in the app
                              setIframePlaybackBlocked(true);
                              setIsPlaying(false);
                            }
                            iframeOpenFallbackRef.current = null;
                          }, 2500);
                        }

                        return;
                      }
                    } catch (e) {
                      // ignore and fall back to messaging below
                    }

                    setIframeTimeout(false);
                    if (iframeTimeoutRef.current) window.clearTimeout(iframeTimeoutRef.current);
                    // Keep the longer timeout as a safety net
                    iframeTimeoutRef.current = window.setTimeout(() => {
                        setIframeTimeout(true);
                        iframeTimeoutRef.current = null;
                    }, 8000);
                }

                // Try to unmute then play (keeps within user gesture)
                postYouTubeCommand('unMute');
                postYouTubeCommand('playVideo');
                setIsPlaying(true);
          }
          return;
      }

      // Fallback: toggle playing state
      setIsPlaying(!isPlaying);
  };

  const handleRetryPlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Reset blocked state and attempt a muted autoplay remount
    setIframePlaybackBlocked(false);
    setIframeTimeout(false);
    if (iframeTimeoutRef.current) { window.clearTimeout(iframeTimeoutRef.current); iframeTimeoutRef.current = null; }
    const yt = getYouTubeId(effectiveVideoUrl);
    if (!yt) return;
    const fallbackSrc = `https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&autoplay=1&mute=1`;
    setIframeSrc(fallbackSrc);
    setIframeKey(k => k + 1);
    setIsPlaying(true);
    // Re-arm the longer timeout as a safety net
    iframeTimeoutRef.current = window.setTimeout(() => {
      setIframeTimeout(true);
      iframeTimeoutRef.current = null;
    }, 8000);
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
            data-testid="video-container"
            className="relative shrink-0 bg-[#111] group overflow-hidden cursor-pointer"
            style={{ height: '55vh' }}
            onClick={togglePlay}
        >
                     {/* Video Source */}
                     {effectiveVideoUrl ? (
                         (() => {
                             const yt = getYouTubeId(effectiveVideoUrl);
                             if (yt) {
                                // Use controlled iframe src and key to allow remounting for autoplay fallbacks
                                const initial = iframeSrc ?? `https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
                                 return (
                                     <iframe
                                        key={`yt-${exercise.id}-${iframeKey}`}
                                        ref={iframeRef}
                                        title={exercise.name}
                                        src={initial}
                                        onLoad={() => setIframeLoaded(true)}
                                        className="absolute inset-0 w-full h-full"
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                        frameBorder="0"
                                        allow="autoplay; encrypted-media; clipboard-write; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                     />
                                 );
                             }

                            const isFile = /\.(mp4|webm|ogg)(?:\?|$)/i.test(effectiveVideoUrl);
                            if (isFile) {
                                if (videoError) {
                                    return <img src={exerciseImage} className="w-full h-full object-cover opacity-90" alt={exercise.name} />;
                                }

                                return (
                                  <video
                                    ref={videoRef}
                                    src={effectiveVideoUrl}
                                    poster={exerciseImage}
                                    preload="metadata"
                                    className="w-full h-full object-cover"
                                    playsInline
                                    loop
                                    onLoadedMetadata={() => {
                                      if (videoRef.current) setDuration(videoRef.current.duration);
                                    }}
                                    onTimeUpdate={handleTimeUpdate}
                                    onEnded={() => setIsPlaying(false)}
                                    onError={() => {
                                      // Network or format error (e.g. 403 hotlink) — fall back to image
                                      // eslint-disable-next-line no-console
                                      console.error('Video failed to load', effectiveVideoUrl);
                                      setVideoError(true);
                                      setIsPlaying(false);
                                      // Show user-friendly message
                                      setTimeout(() => {
                                        if (typeof window !== 'undefined') {
                                          console.log('This video cannot be embedded due to restrictions. Showing image fallback.');
                                        }
                                      }, 100);
                                    }}
                                    onCanPlay={() => {
                                      // Clear any previous error once the source is playable
                                      if (videoError) setVideoError(false);
                                    }}
                                  />
                                );
                            }

                             // Unknown remote URL: fall back to image preview
                             return <img src={exerciseImage} className="w-full h-full object-cover opacity-90" alt={exercise.name} />;
                         })()
                     ) : (
                         <img src={exerciseImage} className="w-full h-full object-cover opacity-90" alt={exercise.name} />
                     )}

           {/* Debug Overlay */}
           {showDebug && (
             <div className="absolute top-4 right-4 bg-black/60 text-xs text-white p-3 rounded-md z-40 pointer-events-auto max-w-xs">
               <div className="font-bold mb-1">Video Debug</div>
               <div data-testid="diagnostics-text" className="text-[12px] leading-tight">
                 <div><strong>ytId:</strong> {ytId ?? '—'}</div>
                 <div><strong>iframeLoaded:</strong> {String(iframeLoaded)}</div>
                 <div><strong>iframeReady:</strong> {String(iframeReady)}</div>
                 <div><strong>iframeState:</strong> {String(iframeState)}</div>
                 <div><strong>iframeTimeout:</strong> {String(iframeTimeout)}</div>
                 <div className="truncate"><strong>src:</strong> {iframeSrc ?? (ytId ? `https://www.youtube.com/watch?v=${ytId}` : '—')}</div>
               </div>
             </div>
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

                    {ytId && (
                      <button
                        onClick={(e) => { e.stopPropagation(); window.open(`https://www.youtube.com/watch?v=${ytId}`, '_blank', 'noopener'); }}
                        className="h-10 px-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-[11px] font-bold text-white hover:bg-white/10 transition-colors"
                      >
                        Open
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = !showDebug;
                        setShowDebug(next);
                        if (typeof window !== 'undefined' && window.localStorage) {
                          if (next) window.localStorage.setItem('video-debug', '1');
                          else window.localStorage.removeItem('video-debug');
                        }
                      }}
                      className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-zinc-300 hover:text-white transition-colors border border-white/10"
                    >
                      <Film size={16} />
                    </button>

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
                                     data-testid="play-toggle"
                                     data-playing={isPlaying}
                                     onClick={togglePlay}
                   className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl group"
                 >
                    {isPlaying ? <Pause size={32} className="fill-current" /> : <Play size={32} className="fill-current ml-2 group-hover:scale-110 transition-transform" />}
                 </motion.button>

                 {/* Playback blocked overlay (shown when autoplay fallback would have opened YouTube) */}
                 {iframePlaybackBlocked && (
                   <div data-testid="yt-fallback" className="absolute inset-0 flex items-center justify-center z-30 pointer-events-auto">
                     <div className="bg-black/80 p-4 rounded-md text-center text-white max-w-xs mx-4">
                       <div className="mb-2 font-bold">Playback blocked</div>
                       <div className="text-sm mb-4">Your browser blocked autoplay for this video. You can open it on YouTube or try again.</div>
                       <div className="flex gap-2 justify-center">
                         <button data-testid="open-on-youtube-btn" onClick={(e) => { e.stopPropagation(); if (ytId) { try { window.open(`https://www.youtube.com/watch?v=${ytId}`, '_blank', 'noopener'); } catch (e) {} } }} className="px-3 py-2 rounded-md bg-white text-black font-bold">Open on YouTube</button>
                         <button data-testid="retry-play-btn" onClick={(e) => handleRetryPlay(e)} className="px-3 py-2 rounded-md border border-white/10">Try again</button>
                       </div>
                     </div>
                   </div>
                 )}
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

                 {/* Missing Data Warning */}
                 <MissingDataWarning missingFields={missingFields} />

                 {/* Data Source Indicator (Development Only) */}
                 <DataSourceIndicator exercise={exercise as ExerciseWithSource} />

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
                         <div className="text-zinc-500 text-sm pl-8 space-y-2">
                           <p className="italic">Detailed steps not available for this exercise.</p>
                           <p className="text-xs">Please refer to the video demonstration or consult with a fitness professional for proper form.</p>
                         </div>
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
