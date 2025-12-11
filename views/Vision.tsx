
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Camera, MoreHorizontal, ArrowRight, Scale, 
  TrendingDown, History, Maximize2, Grid, ChevronRight, X, Image as ImageIcon, RotateCcw, ChevronLeft
} from 'lucide-react';

// Mock Data matching screenshot
const MOCK_PHOTOS = [
  { 
    id: 'p1', 
    date: 'Sep 24', 
    weight: '192.5', 
    fat: '18%',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800&auto=format&fit=crop', 
    notes: 'Starting Point'
  },
  { 
    id: 'p2', 
    date: 'Oct 10', 
    weight: '188.2', 
    fat: '16.5%',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop', 
    notes: 'Week 2 Check-in'
  },
  { 
    id: 'p3', 
    date: 'Oct 24', 
    weight: '185.0', 
    fat: '15%',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop', 
    notes: 'Current Physique'
  },
];

export const Vision: React.FC = () => {
  const [photos, setPhotos] = useState(MOCK_PHOTOS);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Selection state for comparison
  const [startPhotoId, setStartPhotoId] = useState(MOCK_PHOTOS[0].id);
  const [currentPhotoId, setCurrentPhotoId] = useState(MOCK_PHOTOS[MOCK_PHOTOS.length - 1].id);

  const startPhoto = photos.find(p => p.id === startPhotoId) || photos[0];
  const currentPhoto = photos.find(p => p.id === currentPhotoId) || photos[photos.length - 1];

  const weightChange = (parseFloat(currentPhoto.weight) - parseFloat(startPhoto.weight)).toFixed(1);
  const daysDiff = 30; // Mock calculation

  // --- Comparison Slider Logic ---
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent | TouchEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleInteractionStart = () => {
    isDragging.current = true;
  };

  const handleInteractionEnd = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleInteractionEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, []);

  const handleUpload = () => {
    // Simulate upload
    setIsUploadOpen(false);
    const newPhoto = {
        id: `new-${Date.now()}`,
        date: 'Today',
        weight: '184.5',
        fat: '14.8%',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
        notes: 'Just Added'
    };
    setPhotos([...photos, newPhoto]);
    setCurrentPhotoId(newPhoto.id);
  };

  return (
    <div className="flex flex-col h-full px-6 pt-2">
      
      {/* Top Stats - Compact and Dark */}
      <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
          <div className="bg-[#1C1C1E] p-5 rounded-[28px] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Scale size={48} />
              </div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  Weight Change
              </div>
              <div className="text-3xl font-bold font-display text-white flex items-center gap-1 leading-none">
                  {weightChange} <span className="text-sm font-medium text-zinc-500 mt-2">lbs</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-bold text-[#30D158] bg-[#30D158]/10 px-2 py-1 rounded-md border border-[#30D158]/20">
                  <TrendingDown size={10} /> On Track
              </div>
          </div>
          
          <div className="bg-[#1C1C1E] p-5 rounded-[28px] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <History size={48} />
              </div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Timeline</div>
              <div className="text-3xl font-bold font-display text-white flex items-center gap-1 leading-none">
                  {daysDiff} <span className="text-sm font-medium text-zinc-500 mt-2">Days</span>
              </div>
              <div className="mt-2 text-[10px] font-bold text-zinc-400">
                  {photos.length} Updates Logged
              </div>
          </div>
      </div>

      {/* Main Visualization Header */}
      <div className="flex justify-between items-end mb-4 px-1 shrink-0">
          <div>
              <h2 className="text-xl font-bold font-display text-white tracking-tight">Progress Visualization</h2>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Compare your start vs current form.</p>
          </div>
          <button className="w-8 h-8 rounded-full bg-[#1C1C1E] flex items-center justify-center text-zinc-400 border border-white/10 hover:text-white transition-colors active:scale-95">
              <Maximize2 size={14} />
          </button>
      </div>

      {/* Comparison Area - Fills remaining space */}
      <div className="flex-1 relative rounded-[32px] overflow-hidden border border-white/10 bg-[#111] shadow-2xl min-h-[400px] mb-24">
          <div 
            ref={sliderRef}
            className="absolute inset-0 cursor-ew-resize select-none touch-none"
            onMouseDown={handleInteractionStart}
            onTouchStart={handleInteractionStart}
          >
              {/* Before Image (Left Side) */}
              <div className="absolute inset-0 w-full h-full">
                  <img src={startPhoto.image} className="w-full h-full object-cover opacity-60" alt="Before" draggable={false} />
                  <div className="absolute top-6 left-6">
                      <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                          {startPhoto.date}
                      </div>
                  </div>
              </div>

              {/* After Image (Right Side / Clipped) */}
              <div 
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
              >
                  <img src={currentPhoto.image} className="w-full h-full object-cover" alt="After" draggable={false} />
                  <div className="absolute top-6 right-6">
                      <div className="px-3 py-1.5 rounded-full bg-[#0A84FF] text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20">
                          {currentPhoto.date}
                      </div>
                  </div>
              </div>

              {/* Slider Handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize z-20 flex items-center justify-center backdrop-blur-sm"
                style={{ left: `${sliderPosition}%` }}
              >
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                      <div className="flex gap-0.5">
                          <ChevronLeft size={12} className="text-black -mr-0.5" />
                          <ChevronRight size={12} className="text-black -ml-0.5" />
                      </div>
                  </div>
              </div>

              {/* Bottom Info Overlay */}
              <div className="absolute bottom-28 left-6 right-6 flex justify-between items-end z-10 pointer-events-none">
                  <div>
                      <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Starting Weight</div>
                      <div className="text-2xl font-bold font-display text-white tabular-nums drop-shadow-md">
                          {startPhoto.weight} <span className="text-sm font-medium text-zinc-300">lbs</span>
                      </div>
                  </div>
                  <div className="text-right">
                      <div className="text-[9px] font-bold text-[#0A84FF] uppercase tracking-widest mb-1">Current Weight</div>
                      <div className="text-2xl font-bold font-display text-white tabular-nums drop-shadow-md">
                          {currentPhoto.weight} <span className="text-sm font-medium text-zinc-300">lbs</span>
                      </div>
                  </div>
              </div>

              {/* Gradient for Dock Visibility */}
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

              {/* Floating Action Dock */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 p-2 bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl pointer-events-auto">
                  <button 
                    onClick={() => setIsGalleryOpen(true)}
                    className="w-14 h-14 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Gallery"
                  >
                      <Grid size={24} />
                  </button>

                  <div className="w-px h-8 bg-white/10" />

                  <button 
                    onClick={() => setIsUploadOpen(true)}
                    className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all"
                    title="Take Photo"
                  >
                      <Camera size={28} className="text-black" strokeWidth={2} />
                  </button>
              </div>
          </div>
      </div>

      {/* Gallery Modal */}
      {createPortal(
        <AnimatePresence>
            {isGalleryOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex flex-col bg-black"
                >
                    <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-[#1C1C1E] shrink-0 pt-safe-top">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsGalleryOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                                <ArrowRight size={20} className="rotate-180" />
                            </button>
                            <h2 className="text-xl font-bold font-display text-white">Body Gallery</h2>
                        </div>
                        <button 
                            onClick={() => setIsUploadOpen(true)}
                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Upload Card */}
                            <button 
                                onClick={() => setIsUploadOpen(true)}
                                className="aspect-[4/5] rounded-[24px] border border-dashed border-white/20 flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-all group"
                            >
                                <div className="w-14 h-14 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                                    <Camera size={24} />
                                </div>
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300">Add New</span>
                            </button>

                            {/* Photos */}
                            {[...photos].reverse().map((photo) => (
                                <div key={photo.id} className="relative aspect-[4/5] rounded-[24px] overflow-hidden group bg-[#1C1C1E] border border-white/5">
                                    <img src={photo.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                                    
                                    <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-bold text-white">
                                        {photo.date}
                                    </div>

                                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                        <div>
                                            <div className="text-white font-bold text-sm">{photo.weight}</div>
                                            <div className="text-[9px] text-zinc-400 uppercase tracking-wider">{photo.fat}</div>
                                        </div>
                                        {/* Actions to set compare */}
                                        <div className="flex gap-1.5">
                                            <button 
                                                onClick={() => { setStartPhotoId(photo.id); setIsGalleryOpen(false); }}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${startPhotoId === photo.id ? 'bg-[#0A84FF] border-[#0A84FF] text-white' : 'bg-black/40 border-white/20 text-zinc-400 hover:text-white'}`}
                                                title="Set as Start"
                                            >
                                                <span className="text-[10px] font-bold">A</span>
                                            </button>
                                            <button 
                                                onClick={() => { setCurrentPhotoId(photo.id); setIsGalleryOpen(false); }}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${currentPhotoId === photo.id ? 'bg-[#0A84FF] border-[#0A84FF] text-white' : 'bg-black/40 border-white/20 text-zinc-400 hover:text-white'}`}
                                                title="Set as Current"
                                            >
                                                <span className="text-[10px] font-bold">B</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
      )}

      {/* Upload Modal */}
      {createPortal(
        <AnimatePresence>
            {isUploadOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[250] flex flex-col bg-black"
                >
                    <div className="relative flex-1 bg-zinc-900">
                        {/* Camera Mockup */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Camera size={64} className="text-white/10" />
                            <p className="absolute mt-24 text-zinc-600 font-bold uppercase tracking-widest text-xs">Camera Preview</p>
                        </div>
                        
                        <button onClick={() => setIsUploadOpen(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center pt-safe-top">
                            <X size={24} />
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-between items-center safe-area-bottom">
                            <button className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-colors">
                                <ImageIcon size={20} />
                            </button>
                            <button 
                                onClick={handleUpload}
                                className="w-20 h-20 rounded-full bg-white border-4 border-zinc-300 flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
                            >
                                <div className="w-16 h-16 rounded-full bg-white border-2 border-black" />
                            </button>
                            <button className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-colors">
                                <RotateCcw size={20} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};
