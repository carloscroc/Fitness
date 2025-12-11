
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { ChevronLeft, Activity, TrendingUp, Timer } from 'lucide-react';
import { AppView } from '../types.ts';

// --- Types & Data ---
type MetricType = 'workouts' | 'volume' | 'time';
type TimeRange = '7D' | '1M' | '3M';

interface MetricData {
  id: MetricType;
  label: string;
  value: string;
  subLabel: string;
  icon: any;
  color: string;
  hex: string;
  chartTitle: string[];
  unit: string;
  data: Record<TimeRange, { name: string; value: number }[]>;
}

const METRICS: Record<MetricType, MetricData> = {
  workouts: {
    id: 'workouts',
    label: 'Workouts',
    value: '14',
    subLabel: 'WORKOUTS',
    icon: Activity,
    color: 'blue',
    hex: '#3B82F6',
    chartTitle: ['TOTAL', 'WORKOUTS', 'COMPLETED'],
    unit: '',
    data: {
      '7D': [
        { name: 'M', value: 1 }, { name: 'T', value: 1 }, { name: 'W', value: 0 },
        { name: 'T', value: 2 }, { name: 'F', value: 1 }, { name: 'S', value: 2 }, { name: 'S', value: 1 },
      ],
      '1M': [
        { name: 'W1', value: 3 }, { name: 'W2', value: 4 }, { name: 'W3', value: 5 }, { name: 'W4', value: 4 },
      ],
      '3M': [
        { name: 'Aug', value: 12 }, { name: 'Sep', value: 15 }, { name: 'Oct', value: 14 },
      ]
    }
  },
  volume: {
    id: 'volume',
    label: 'Vol (Lbs)',
    value: '92k',
    subLabel: 'VOL (LBS)',
    icon: TrendingUp,
    color: 'orange',
    hex: '#F97316',
    chartTitle: ['TOTAL', 'WEIGHT', 'LIFTED'],
    unit: 'lbs',
    data: {
      '7D': [
        { name: 'M', value: 11000 }, { name: 'T', value: 16500 }, { name: 'W', value: 12000 },
        { name: 'T', value: 19000 }, { name: 'F', value: 15000 }, { name: 'S', value: 22000 }, { name: 'S', value: 8000 },
      ],
      '1M': [
        { name: 'W1', value: 45000 }, { name: 'W2', value: 52000 }, { name: 'W3', value: 48000 }, { name: 'W4', value: 92000 },
      ],
      '3M': [
        { name: 'Aug', value: 180000 }, { name: 'Sep', value: 210000 }, { name: 'Oct', value: 250000 },
      ]
    }
  },
  time: {
    id: 'time',
    label: 'Time',
    value: '16h',
    subLabel: 'TIME',
    icon: Timer,
    color: 'purple',
    hex: '#A855F7',
    chartTitle: ['TOTAL', 'TIME', 'ACTIVE'],
    unit: 'm',
    data: {
      '7D': [
        { name: 'M', value: 45 }, { name: 'T', value: 90 }, { name: 'W', value: 30 },
        { name: 'T', value: 120 }, { name: 'F', value: 60 }, { name: 'S', value: 150 }, { name: 'S', value: 45 },
      ],
      '1M': [
        { name: 'W1', value: 320 }, { name: 'W2', value: 400 }, { name: 'W3', value: 350 }, { name: 'W4', value: 480 },
      ],
      '3M': [
        { name: 'Aug', value: 1200 }, { name: 'Sep', value: 1400 }, { name: 'Oct', value: 1600 },
      ]
    }
  }
};

interface ProgressProps {
  onNavigate: (view: AppView) => void;
  initialMetric?: string;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1C1C1E] px-3 py-2 rounded-lg shadow-xl border border-white/10">
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-white text-lg font-bold font-display tabular-nums leading-none">
          {payload[0].value.toLocaleString()} {unit === 'lbs' ? '' : unit}
        </p>
      </div>
    );
  }
  return null;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const Progress: React.FC<ProgressProps> = ({ onNavigate, initialMetric }) => {
  const [activeMetric, setActiveMetric] = useState<MetricType>('volume');
  const [timeRange, setTimeRange] = useState<TimeRange>('7D');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Force dark mode logic for this view as requested by screenshot aesthetic
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    
    if (initialMetric && METRICS[initialMetric as MetricType]) {
        setActiveMetric(initialMetric as MetricType);
    }
  }, [initialMetric]);

  const currentMetric = METRICS[activeMetric];
  const chartData = currentMetric.data[timeRange];

  // Helper for dynamic styles
  const getActiveCardStyle = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-[#1e293b] border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]';
      case 'orange': return 'bg-[#2a1b12] border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)]';
      case 'purple': return 'bg-[#2e1065] border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]';
      default: return '';
    }
  };

  const getIconStyle = (color: string, isActive: boolean) => {
    if (!isActive) return 'bg-[#2C2C2E] text-gray-400';
    switch (color) {
      case 'blue': return 'bg-blue-500/20 text-blue-500';
      case 'orange': return 'bg-orange-500/20 text-orange-500';
      case 'purple': return 'bg-purple-500/20 text-purple-500';
      default: return '';
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-black text-white pb-10 font-sans"
    >
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl pt-[env(safe-area-inset-top)] border-b border-white/5">
        <div className="px-5 py-4 flex items-center gap-4">
          <button 
            onClick={() => onNavigate(AppView.COACH)} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1C1C1E] border border-white/10 text-white hover:bg-[#2C2C2E] transition-colors"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">Analytics</h1>
        </div>
      </div>

      <div className="px-5 space-y-8 mt-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-3">
          {Object.values(METRICS).map((metric) => {
            const isActive = activeMetric === metric.id;
            return (
              <motion.button
                key={metric.id}
                variants={itemVariants}
                onClick={() => setActiveMetric(metric.id)}
                className={`
                  relative flex flex-col items-center justify-center h-[160px] rounded-[28px] border transition-all duration-300 group
                  ${isActive ? getActiveCardStyle(metric.color) : 'bg-[#1C1C1E] border-white/5 hover:bg-[#2C2C2E]'}
                `}
              >
                {/* Selection Indicator Corner (Matches screenshot style) */}
                {isActive && (
                    <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-white opacity-50" />
                )}

                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${getIconStyle(metric.color, isActive)}`}>
                  <metric.icon size={20} strokeWidth={2.5} />
                </div>
                
                <div className="text-center">
                   <div className="text-2xl font-bold font-display text-white tracking-tight tabular-nums mb-1">
                      {metric.value}
                   </div>
                   <div className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                      {metric.subLabel}
                   </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Main Chart Section */}
        <motion.div 
           layout
           variants={itemVariants} 
           className="bg-[#1C1C1E] rounded-[32px] p-6 border border-white/5 relative overflow-hidden min-h-[420px]"
        >
           {/* Chart Header Layout */}
           <div className="flex justify-between items-start mb-8">
             <div className="flex flex-col">
               {currentMetric.chartTitle.map((line, i) => (
                  <motion.span
                    key={`${activeMetric}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-2xl font-black font-display text-white uppercase leading-[0.9] tracking-tighter"
                  >
                    {line}
                  </motion.span>
               ))}
             </div>
             
             {/* Time Range Toggle */}
             <div className="flex bg-black border border-white/10 p-1 rounded-full items-center">
                {(['7D', '1M', '3M'] as TimeRange[]).map(range => (
                  <button 
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`
                      px-3 py-1.5 text-[10px] font-bold rounded-full transition-all tracking-wide 
                      ${timeRange === range ? 'bg-[#2C2C2E] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}
                    `}
                  >
                    {range}
                  </button>
                ))}
             </div>
           </div>

           {/* Chart Area */}
           <div className="h-[280px] w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={currentMetric.hex} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={currentMetric.hex} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2C2C2E" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fill: '#71717A', fontWeight: 600, fontFamily: 'Outfit'}} 
                        dy={15} 
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 11, fill: '#71717A', fontWeight: 600, fontFamily: 'Outfit'}} 
                        tickCount={5}
                        dx={-10}
                        domain={[0, 'auto']}
                    />
                    <Tooltip 
                      content={<CustomTooltip unit={currentMetric.unit} />}
                      cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={currentMetric.hex} 
                        strokeWidth={3} 
                        fill="url(#colorGradient)" 
                        animationDuration={800}
                    />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </motion.div>

      </div>
    </motion.div>
  );
};
