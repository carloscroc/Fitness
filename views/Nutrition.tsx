
import React, { useState, useRef, useEffect } from 'react';
import { 
  Flame, Clock, ShoppingBag, Check,
  Search, ArrowRight, Zap, ChevronRight, X, ChevronLeft, Filter, Plus, BookOpen, Utensils
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { MealDetailModal } from '../components/MealDetailModal.tsx';
import { Meal } from '../types.ts';
import { Button } from '../components/ui/Button.tsx';

const ASSIGNED_MEALS: Meal[] = [
  {
    id: 'm1',
    type: 'BREAKFAST',
    title: 'Power Berry &\nOats Bowl',
    description: 'Steel-cut oats topped with fresh blueberries, chia seeds, and a scoop of vanilla whey.',
    coachNote: 'Complex carbs to fuel your morning session. Don\'t skip the chia seeds!',
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=800&auto=format&fit=crop',
    calories: 420,
    macros: { p: 24, c: 55, f: 12 },
    prepTime: '10 MIN',
    completed: true,
    tags: ['PRE-WORKOUT', 'HIGH FIBER']
  },
  {
    id: 'm2',
    type: 'LUNCH',
    title: 'Grilled Lemon\nChicken',
    description: 'Herb-marinated chicken breast served with quinoa and roasted asparagus.',
    coachNote: 'High protein for recovery. Quinoa provides the complete amino acid profile.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    calories: 550,
    macros: { p: 45, c: 50, f: 15 },
    prepTime: '20 MIN',
    completed: false,
    tags: ['RECOVERY', 'LEAN']
  },
  {
    id: 'm3',
    type: 'SNACK',
    title: 'Greek Yogurt\nParfait',
    description: 'Zero fat greek yogurt with honey and almonds.',
    coachNote: '',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800&auto=format&fit=crop',
    calories: 220,
    macros: { p: 18, c: 20, f: 8 },
    prepTime: '5 MIN',
    completed: false,
    tags: ['QUICK']
  },
  {
    id: 'm4',
    type: 'DINNER',
    title: 'Salmon & Sweet\nPotato',
    description: 'Pan-seared salmon fillet with mashed sweet potato and steamed broccoli.',
    coachNote: 'Rich in Omega-3s. Keep the skin on for extra nutrients.',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?q=80&w=800&auto=format&fit=crop',
    calories: 600,
    macros: { p: 40, c: 45, f: 22 },
    prepTime: '25 MIN',
    completed: false,
    tags: ['OMEGA-3', 'DINNER']
  }
];

const LIBRARY_MEALS: Meal[] = [
    {
        id: 'l1',
        type: 'LUNCH',
        title: 'Turkey Avocado Wrap',
        description: 'Whole wheat wrap with sliced turkey, avocado, and spinach.',
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800&auto=format&fit=crop',
        calories: 450,
        macros: { p: 35, c: 40, f: 18 },
        prepTime: '10 MIN',
        completed: false,
        tags: ['On-the-go']
    },
    {
        id: 'l2',
        type: 'DINNER',
        title: 'Steak & Chimichurri',
        description: 'Grilled flank steak with fresh herb sauce. Served with a side of mixed greens.',
        image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800&auto=format&fit=crop',
        calories: 650,
        macros: { p: 55, c: 10, f: 35 },
        prepTime: '30 MIN',
        completed: false,
        tags: ['Keto', 'High Protein']
    }
];

const COLLECTIONS = [
  { id: 'high-protein', title: 'High Protein', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop', count: '120+' },
  { id: 'quick', title: 'Under 15 Min', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop', count: '45' },
  { id: 'keto', title: 'Keto Friendly', image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=600&auto=format&fit=crop', count: '60+' },
  { id: 'plant', title: 'Plant Based', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop', count: '80+' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface NutritionProps {
  initialOpenLibrary?: boolean;
}

export const Nutrition: React.FC<NutritionProps> = ({ initialOpenLibrary }) => {
  const [meals, setMeals] = useState(ASSIGNED_MEALS);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Use ID to track selected meal to ensure modal gets fresh state updates
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  
  const [isLibraryItem, setIsLibraryItem] = useState(false);
  const [isFullLibraryOpen, setIsFullLibraryOpen] = useState(!!initialOpenLibrary);
  const [searchQuery, setSearchQuery] = useState('');
  
  const carouselRef = useRef<HTMLDivElement>(null);

  // Derived state for the modal
  const activeMeal = meals.find(m => m.id === selectedMealId) || LIBRARY_MEALS.find(m => m.id === selectedMealId);

  useEffect(() => {
    if (initialOpenLibrary) {
      setIsFullLibraryOpen(true);
    }
  }, [initialOpenLibrary]);

  const toggleMealCompletion = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMeals(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const addToPlan = (meal: Meal) => {
    const newMeal = { ...meal, id: `custom-${Date.now()}`, type: 'EXTRA', tags: [...(meal.tags || []), 'CUSTOM'] };
    setMeals(prev => [...prev, newMeal]);
    setIsFullLibraryOpen(false);
    setTimeout(() => {
        if (carouselRef.current) {
            carouselRef.current.scrollTo({ left: carouselRef.current.scrollWidth, behavior: 'smooth' });
        }
    }, 300);
  };

  const handleMealClick = (mealId: string, isLibrary: boolean) => {
    setSelectedMealId(mealId);
    setIsLibraryItem(isLibrary);
  };

  const filteredLibraryMeals = LIBRARY_MEALS.filter(m => {
    const matchesCategory = activeCategory === 'All' || m.tags?.includes(activeCategory) || m.type === activeCategory || (activeCategory === 'High Protein' && m.macros.p > 30) || (activeCategory === 'Under 15 Min' && parseInt(m.prepTime) <= 15);
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div 
      initial={{opacity: 0}} 
      animate={{opacity: 1}} 
      className="min-h-screen bg-black text-white pb-32 font-sans selection:bg-blue-500/30"
    >
      
      {/* Header */}
      <div className="pt-[calc(env(safe-area-inset-top)+20px)] px-6 pb-2 sticky top-0 z-30 pointer-events-none bg-gradient-to-b from-black via-black/80 to-transparent">
        <div className="flex justify-between items-start pointer-events-auto">
          <div>
            <h1 className="text-4xl font-extrabold font-display text-white tracking-tight leading-none mb-1.5 drop-shadow-lg">Nutrition</h1>
            <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">Day 24 • High Carb Day</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setIsFullLibraryOpen(true)} className="w-11 h-11 flex items-center justify-center rounded-full bg-[#1C1C1E] text-white border border-white/10 active:scale-95 transition-transform hover:bg-[#2C2C2E]">
               <BookOpen size={20} strokeWidth={2} />
             </button>
             <button className="w-11 h-11 flex items-center justify-center rounded-full bg-[#1C1C1E] text-white border border-white/10 active:scale-95 transition-transform hover:bg-[#2C2C2E]">
               <ShoppingBag size={20} strokeWidth={2} />
             </button>
          </div>
        </div>
      </div>

      <div className="space-y-6 mt-6 relative z-10">
        
        {/* Cinematic Card Carousel */}
        <motion.div 
            ref={carouselRef}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex overflow-x-auto gap-4 px-6 pb-8 snap-x snap-mandatory no-scrollbar after:content-[''] after:w-4 after:shrink-0"
        >
            {meals.map((meal) => (
                <motion.div 
                onClick={() => handleMealClick(meal.id, false)}
                variants={itemVariants}
                key={meal.id}
                className="snap-center shrink-0 w-[85vw] md:w-[360px] h-[520px] rounded-[36px] relative overflow-hidden group shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] bg-[#111] cursor-pointer border border-white/10"
                >
                {/* Background Image - Takes up top half */}
                <div className="absolute top-0 left-0 right-0 h-[60%]">
                    <img 
                        src={meal.image} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-100" 
                        alt={meal.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                </div>

                {/* Vertical Tag Stack (Top Left) */}
                <div className="absolute top-6 left-6 flex flex-col items-start gap-2 z-20">
                    <span className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/5 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                        {meal.type}
                    </span>
                    {meal.tags?.map(tag => (
                        <span key={tag} className="px-4 py-1.5 rounded-full bg-[#1C1C1E]/80 backdrop-blur-md border border-white/5 text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Floating Check Button (Top Right) */}
                <div className="absolute top-6 right-6 z-20">
                    <button 
                        onClick={(e) => toggleMealCompletion(meal.id, e)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 shadow-2xl ${
                            meal.completed 
                            ? 'bg-[#30D158] text-white border-[#30D158] scale-100 shadow-[0_0_20px_rgba(48,209,88,0.5)]' 
                            : 'bg-black/40 text-white border-white/10 hover:bg-black/60'
                        }`}
                    >
                        <Check size={28} strokeWidth={4} className={meal.completed ? 'opacity-100' : 'opacity-40'} />
                    </button>
                </div>

                {/* White Info Card (Bottom Overlapping) */}
                <div className="absolute bottom-3 left-3 right-3 z-20 top-[45%]">
                    <div className="bg-white h-full rounded-[32px] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                        
                        <div>
                            {/* Meta Data */}
                            <div className="flex items-center gap-3 mb-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest relative z-10">
                                <span className="flex items-center gap-1 text-zinc-500"><Clock size={12} /> {meal.prepTime}</span>
                                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                                <span className="flex items-center gap-1 text-orange-500"><Flame size={12} className="fill-current" /> {meal.calories} KCAL</span>
                            </div>

                            {/* Title */}
                            <h3 className={`text-[32px] font-bold font-display text-black leading-[0.95] mb-4 tracking-tight line-clamp-2 ${meal.completed ? 'line-through decoration-black/20 opacity-50' : ''}`}>
                                {meal.title}
                            </h3>

                            {/* Coach Note Box - Blue */}
                            {meal.coachNote && (
                                <div className="mb-4 p-4 rounded-2xl bg-[#0A84FF]/10 border border-[#0A84FF]/20 relative">
                                    <span className="text-[10px] font-bold text-[#0A84FF] uppercase tracking-widest mb-1.5 block">Coach Note</span>
                                    <p className="text-[13px] text-blue-900 font-medium italic leading-relaxed line-clamp-3">
                                        "{meal.coachNote}"
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Macros Preview Row - Always Visible */}
                        <div className="flex justify-between items-end mt-2 pt-4 border-t border-zinc-100">
                            <div className="flex gap-5">
                                <div className="flex flex-col">
                                    <span className="text-[18px] font-bold text-black leading-none tabular-nums">{meal.macros.p}g</span>
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase mt-1">Prot</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[18px] font-bold text-black leading-none tabular-nums">{meal.macros.c}g</span>
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase mt-1">Carb</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[18px] font-bold text-black leading-none tabular-nums">{meal.macros.f}g</span>
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase mt-1">Fat</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-[#0A84FF] uppercase tracking-wider group-hover:translate-x-1 transition-transform mb-1">
                                View Full Details <ArrowRight size={12} />
                            </div>
                        </div>
                    </div>
                </div>
                </motion.div>
            ))}

            {/* "Add More" Placeholder Card */}
            <motion.div 
                onClick={() => setIsFullLibraryOpen(true)}
                className="snap-center shrink-0 w-[100px] h-[520px] rounded-[36px] border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-colors group"
            >
                <div className="w-12 h-12 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:bg-white/10 transition-colors">
                    <Plus size={20} />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest rotate-90 whitespace-nowrap">Add Meal</span>
            </motion.div>
        </motion.div>

        {/* Explore Library Section */}
        <div className="px-6 mb-4 mt-2 flex justify-between items-end">
           <div>
              <h2 className="text-xl font-bold font-display text-white">Explore Library</h2>
              <p className="text-zinc-500 text-[11px] font-medium mt-1">Curated collections for your goals</p>
           </div>
           <button onClick={() => setIsFullLibraryOpen(true)} className="text-[11px] font-bold text-[#0A84FF] uppercase tracking-wider mb-0.5 hover:text-white transition-colors">View All</button>
        </div>

        <div className="flex gap-4 overflow-x-auto px-6 pb-24 no-scrollbar snap-x after:content-[''] after:w-6 after:shrink-0">
           {COLLECTIONS.map((col, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => { setActiveCategory(col.title); setIsFullLibraryOpen(true); }} 
                className="snap-start shrink-0 w-[260px] h-[170px] rounded-[28px] relative overflow-hidden group cursor-pointer active:scale-95 transition-transform border border-white/5 shadow-lg"
              >
                 <img src={col.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                 
                 <div className="absolute top-3 right-3">
                     <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                        <span className="text-[9px] font-bold text-white uppercase tracking-wider">{col.count}</span>
                     </div>
                 </div>

                 <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-xl font-bold font-display text-white leading-tight mb-1">{col.title}</h3>
                    <div className="flex items-center gap-2">
                       <div className="h-0.5 w-6 bg-[#0A84FF] rounded-full" />
                       <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Collection</span>
                    </div>
                 </div>
              </motion.div>
           ))}
        </div>
      </div>

      
      <AnimatePresence>
        {activeMeal && (
          <MealDetailModal 
            meal={activeMeal} 
            isLibraryItem={isLibraryItem}
            onClose={() => setSelectedMealId(null)}
            onAddToPlan={() => addToPlan(activeMeal)}
            onToggleComplete={() => toggleMealCompletion(activeMeal.id)}
          />
        )}

        {/* Full Library Overlay */}
        {isFullLibraryOpen && (
          <motion.div 
              key="full-library"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed inset-0 z-50 bg-black flex flex-col"
          >
              {/* Header */}
              <div className="pt-[calc(env(safe-area-inset-top)+20px)] px-6 pb-4 bg-black/95 backdrop-blur-xl border-b border-white/10 z-20">
                  <div className="flex items-center justify-between mb-6">
                      <button 
                          onClick={() => setIsFullLibraryOpen(false)}
                          className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center text-white border border-white/10 active:scale-95 transition-transform hover:bg-[#2C2C2E]"
                      >
                          <ChevronLeft size={20} />
                      </button>
                      <h2 className="text-xl font-bold font-display text-white">Meal Library</h2>
                      <div className="w-10" />
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                      <input 
                          autoFocus
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search for healthy meals..."
                          className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors font-medium"
                      />
                  </div>

                  {/* Categories */}
                  <div className="flex gap-2.5 overflow-x-auto pt-4 pb-1 no-scrollbar -mx-6 px-6">
                      {['All', 'High Protein', 'Keto', 'Quick', 'Vegan', 'Breakfast', 'Dinner'].map(cat => (
                          <button 
                              key={cat}
                              onClick={() => setActiveCategory(cat)}
                              className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide border transition-all whitespace-nowrap ${
                              activeCategory === cat 
                              ? 'bg-white text-black border-white' 
                              : 'bg-[#1C1C1E] text-zinc-500 border-white/10 hover:text-white'
                              }`}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Grid Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
                  <div className="grid grid-cols-2 gap-4">
                      {filteredLibraryMeals.map((meal) => (
                          <motion.div 
                              key={meal.id}
                              layoutId={`library-full-${meal.id}`}
                              onClick={() => handleMealClick(meal.id, true)}
                              className="bg-[#1C1C1E] rounded-[32px] overflow-hidden border border-white/5 active:scale-[0.98] transition-all cursor-pointer group relative"
                          >
                              <div className="aspect-[4/5] relative overflow-hidden">
                                  <img src={meal.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-transparent to-transparent opacity-90" />
                                  
                                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-bold text-white flex items-center gap-1 border border-white/5">
                                      <Zap size={8} className="text-yellow-500 fill-current" /> {meal.calories}
                                  </div>
                                  
                                  <div className="absolute bottom-0 left-0 right-0 p-4">
                                      <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-1">{meal.type}</div>
                                      <h3 className="text-sm font-bold font-display text-white leading-tight mb-2 line-clamp-2">{meal.title}</h3>
                                      
                                      <div className="flex gap-2 text-[10px] font-bold text-gray-400">
                                          <span>{meal.macros.p}p</span>
                                          <span>{meal.macros.c}c</span>
                                          <span>{meal.macros.f}f</span>
                                      </div>
                                  </div>
                              </div>
                          </motion.div>
                      ))}
                  </div>
                  
                  {filteredLibraryMeals.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                          <Search size={32} className="mb-4 opacity-50" />
                          <p className="text-sm font-medium">No meals found matching your criteria.</p>
                      </div>
                  )}
              </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
