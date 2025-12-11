import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

interface TimerModalProps {
  onClose: () => void;
}

export const TimerModal: React.FC<TimerModalProps> = ({ onClose }) => {
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
  };

  const handlePreset = (seconds: number) => {
    setDuration(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-[#1C1C1E] w-[90%] max-w-[340px] rounded-[32px] p-8 shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden"
      >
        <div className="absolute top-4 right-4">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">Rest Timer</h3>
          
          {/* Circular Progress & Time */}
          <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="4" className="text-gray-100 dark:text-white/5" fill="none" />
              <circle 
                cx="96" cy="96" r="88" 
                stroke="currentColor" 
                strokeWidth="4" 
                className="text-orange-500 transition-all duration-1000 ease-linear" 
                fill="none" 
                strokeDasharray={553} 
                strokeDashoffset={553 - (553 * progress) / 100} 
                strokeLinecap="round"
              />
            </svg>
            <div className="text-5xl font-bold font-display text-ios-text dark:text-white tabular-nums tracking-tight">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mb-8">
             <button onClick={resetTimer} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                <RotateCcw size={20} />
             </button>
             <button onClick={toggleTimer} className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 hover:bg-orange-600 active:scale-95 transition-all">
                {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
             </button>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-4 gap-2 w-full">
            {[30, 60, 90, 120].map((sec) => (
              <button
                key={sec}
                onClick={() => handlePreset(sec)}
                className={`py-2 rounded-[14px] text-xs font-bold transition-all ${
                  duration === sec 
                    ? 'bg-ios-text text-white dark:bg-white dark:text-black' 
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
              >
                {sec < 60 ? `${sec}s` : `${sec/60}m`}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};