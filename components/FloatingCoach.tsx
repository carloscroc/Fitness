import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X, MessageSquare } from 'lucide-react';
import { askFitnessCoach } from '../services/geminiService.ts';
import { ChatMessage } from '../types.ts';

export const FloatingCoach: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I\'m your fitness coach. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await askFitnessCoach(userMsg, true);

    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return createPortal(
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-[116px] right-5 z-[100] w-14 h-14 rounded-full shadow-float bg-[#1C1C1E] text-white border border-white/10 flex items-center justify-center transition-all hover:bg-[#2C2C2E] ${isOpen ? 'opacity-0 pointer-events-none' : ''}`}
      >
        <MessageSquare size={20} strokeWidth={2.5} className="fill-current text-white" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed inset-0 md:inset-auto md:bottom-24 md:right-8 md:w-[380px] md:h-[600px] bg-[#1C1C1E] md:rounded-3xl z-[950] shadow-2xl flex flex-col overflow-hidden border border-white/10"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1C1C1E]/80 backdrop-blur-md sticky top-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(48,209,88,0.5)]"></div>
                <h3 className="font-bold text-white">Coach</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full bg-white/10 text-gray-400 hover:bg-white/20 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] py-3 px-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#0A84FF] text-white rounded-br-none' 
                      : 'bg-[#2C2C2E] text-white rounded-bl-none border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-[#2C2C2E] px-4 py-3 rounded-2xl rounded-bl-none text-gray-400 flex items-center gap-2 text-xs border border-white/5 shadow-sm">
                      <Sparkles size={14} className="animate-pulse text-purple-400" /> Thinking...
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-[#1C1C1E]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your coach..."
                  className="flex-1 bg-black/50 border border-white/10 text-white px-4 py-3 rounded-full focus:outline-none focus:border-blue-500/50 text-[15px] placeholder-gray-600 transition-colors"
                />
                <button type="submit" disabled={isLoading} className="p-3 bg-white text-black rounded-full disabled:opacity-50 hover:bg-gray-200 transition-colors">
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
};