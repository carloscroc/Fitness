import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Play, ChevronRight, MessageSquare, Book, Video, Send, Sparkles, Bot, FileText, ChevronDown } from 'lucide-react';
import { Button } from './ui/Button.tsx';
import { askSupportAgent } from '../services/geminiService.ts';

interface HelpCenterProps {
  initialTab?: 'TUTORIALS' | 'GUIDE' | 'SUPPORT';
  onClose: () => void;
}

const TUTORIALS = [
  { id: 1, title: "Getting Started with NeoFit", duration: "2:30", thumb: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop", category: "Basics" },
  { id: 2, title: "Logging Your First Workout", duration: "3:45", thumb: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop", category: "Workouts" },
  { id: 3, title: "Nutrition Tracking 101", duration: "4:10", thumb: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop", category: "Nutrition" },
  { id: 4, title: "Connecting with Friends", duration: "1:55", thumb: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600&auto=format&fit=crop", category: "Social" },
  { id: 5, title: "Using the AI Coach", duration: "3:20", thumb: "https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=600&auto=format&fit=crop", category: "Features" },
];

const FAQS = [
  { question: "How do I reset my password?", answer: "Go to Profile > Account Settings > Email & Password to update your credentials." },
  { question: "Can I sync with Apple Health?", answer: "Yes! Enable permissions in Profile > Preferences > Integrations." },
  { question: "How do I create a custom workout?", answer: "Tap the '+' button on the Dashboard or Coach tab, then select 'Log Manually' or 'Build Program'." },
];

export const HelpCenter: React.FC<HelpCenterProps> = ({ initialTab = 'TUTORIALS', onClose }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedVideo, setSelectedVideo] = useState<typeof TUTORIALS[0] | null>(null);
  
  // Chat State
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "Hello! I'm your NeoFit support assistant. Ask me anything about using the app, features, or troubleshooting." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    const response = await askSupportAgent(userText);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="bg-[#1C1C1E] w-full md:w-[600px] h-[92vh] md:h-[85vh] rounded-t-[32px] md:rounded-[32px] shadow-2xl relative flex flex-col border border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-[#1C1C1E] shrink-0 sticky top-0 z-20">
            <h2 className="text-xl font-bold font-display text-white">Help & Resources</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 transition-colors">
                <X size={18} />
            </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 flex gap-2 border-b border-white/5 bg-[#1C1C1E]">
            {[
                { id: 'TUTORIALS', label: 'Tutorials', icon: Video },
                { id: 'GUIDE', label: 'User Guide', icon: Book },
                { id: 'SUPPORT', label: 'AI Support', icon: MessageSquare }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                        activeTab === tab.id 
                        ? 'bg-white text-black' 
                        : 'bg-[#2C2C2E] text-zinc-400 hover:text-white'
                    }`}
                >
                    <tab.icon size={14} /> {tab.label}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#000000]">
            <AnimatePresence mode="wait">
                {activeTab === 'TUTORIALS' && (
                    <motion.div 
                        key="tutorials"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-6 grid grid-cols-1 gap-4"
                    >
                        {TUTORIALS.map((video) => (
                            <div 
                                key={video.id}
                                onClick={() => setSelectedVideo(video)}
                                className="bg-[#1C1C1E] rounded-2xl overflow-hidden border border-white/10 flex gap-4 cursor-pointer group active:scale-[0.98] transition-transform"
                            >
                                <div className="w-32 h-24 relative bg-black shrink-0">
                                    <img src={video.thumb} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
                                            <Play size={12} className="fill-current ml-0.5" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[9px] font-bold text-white">
                                        {video.duration}
                                    </div>
                                </div>
                                <div className="p-3 pl-0 flex flex-col justify-center">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">{video.category}</span>
                                    <h3 className="text-sm font-bold text-white mb-1 leading-tight group-hover:text-blue-400 transition-colors">{video.title}</h3>
                                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
                                        <Play size={10} /> Watch Video
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'GUIDE' && (
                    <motion.div 
                        key="guide"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-6 space-y-6"
                    >
                        <div className="bg-[#1C1C1E] rounded-2xl p-5 border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <FileText size={18} className="text-blue-500" /> Quick Start Guide
                            </h3>
                            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                                Welcome to NeoFit! This guide will help you navigate the core features of the application to get the most out of your fitness journey.
                            </p>
                            <button className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                Read Full Article <ChevronRight size={12} />
                            </button>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Frequently Asked Questions</h4>
                            <div className="space-y-3">
                                {FAQS.map((faq, i) => (
                                    <div key={i} className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/5">
                                        <h5 className="text-sm font-bold text-white mb-2">{faq.question}</h5>
                                        <p className="text-xs text-zinc-400 leading-relaxed">{faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'SUPPORT' && (
                    <motion.div 
                        key="support"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col h-full"
                    >
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#2C2C2E]' : 'bg-gradient-to-tr from-blue-500 to-purple-500'}`}>
                                            {msg.role === 'user' ? <div className="w-2 h-2 bg-white rounded-full" /> : <Bot size={16} className="text-white" />}
                                        </div>
                                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                            msg.role === 'user' 
                                            ? 'bg-white text-black rounded-tr-none' 
                                            : 'bg-[#1C1C1E] text-zinc-300 border border-white/10 rounded-tl-none'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                                            <Sparkles size={14} className="text-white animate-pulse" />
                                        </div>
                                        <div className="bg-[#1C1C1E] px-4 py-3 rounded-2xl rounded-tl-none border border-white/10">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        
                        <div className="p-4 bg-[#1C1C1E] border-t border-white/10 shrink-0 safe-area-bottom">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="How can we help?"
                                    className="flex-1 bg-black border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                                <button 
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Video Player Overlay */}
        <AnimatePresence>
            {selectedVideo && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-black flex flex-col"
                >
                    <div className="relative flex-1 bg-black flex items-center justify-center">
                        <img src={selectedVideo.thumb} className="w-full h-full object-contain opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                                 <Play size={32} className="text-white ml-1 fill-current" />
                             </div>
                        </div>
                        <div className="absolute bottom-10 left-0 right-0 text-center px-4">
                             <h3 className="text-white text-xl font-bold font-display mb-2">{selectedVideo.title}</h3>
                             <p className="text-zinc-400 text-sm">Video Player Placeholder</p>
                        </div>
                        <button 
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
                        >
                            <ChevronDown size={24} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </motion.div>
    </motion.div>,
    document.body
  );
};

export default HelpCenter;