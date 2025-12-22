
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Shield, CreditCard, Star, Calendar, Zap, ChevronRight, ChevronLeft, Plus, Download, Lock, Trash2 } from 'lucide-react';
import { Button } from './ui/Button.tsx';

interface SubscriptionModalProps {
  onClose: () => void;
}

type ViewState = 'MAIN' | 'BILLING' | 'PAYMENT' | 'ADD_PAYMENT';

interface PaymentMethod {
  id: string;
  type: 'VISA' | 'MASTERCARD' | 'AMEX';
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<ViewState>('MAIN');
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'VISA', last4: '4242', expiry: '12/25', isDefault: true }
  ]);

  // Form State for Add Payment
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const features = [
    "Unlimited AI Coach Access",
    "Advanced Analytics & Progress Tracking",
    "4K Video Library Access",
    "Priority Support",
    "Custom Meal Plans",
    "Offline Mode"
  ];

  const billingHistory = [
    { date: 'Nov 24, 2023', amount: '$14.99', status: 'Paid', invoice: '#INV-2023-011' },
    { date: 'Oct 24, 2023', amount: '$14.99', status: 'Paid', invoice: '#INV-2023-010' },
    { date: 'Sep 24, 2023', amount: '$14.99', status: 'Paid', invoice: '#INV-2023-009' },
    { date: 'Aug 24, 2023', amount: '$14.99', status: 'Paid', invoice: '#INV-2023-008' },
  ];

  const handleAddPayment = () => {
      setIsProcessing(true);
      // Simulate API call
      setTimeout(() => {
          const newMethod: PaymentMethod = {
              id: Date.now().toString(),
              type: 'VISA', // Mock detection
              last4: cardNumber.slice(-4) || '8888',
              expiry: expiry || '12/28',
              isDefault: false
          };
          
          setPaymentMethods([...paymentMethods, newMethod]);
          setIsProcessing(false);
          setCurrentView('PAYMENT');
          
          // Reset form
          setCardName('');
          setCardNumber('');
          setExpiry('');
          setCvc('');
      }, 1500);
  };

  const toggleDefault = (id: string) => {
      setPaymentMethods(methods => methods.map(m => ({
          ...m,
          isDefault: m.id === id
      })));
  };

  const deleteMethod = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setPaymentMethods(methods => methods.filter(m => m.id !== id));
  };

  const renderMain = () => (
    <motion.div 
        key="main"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col h-full bg-black w-full"
    >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-[#1C1C1E] shrink-0 sticky top-0 z-20">
            <h2 className="text-xl font-bold font-display text-white">My Subscription</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 transition-colors">
                <X size={18} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-black">
            {/* Active Plan Card */}
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 p-8 mb-8">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none" />

                <div className="relative z-10 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-4">
                        <Zap size={10} fill="currentColor" /> Active Plan
                    </div>
                    <h1 className="text-3xl font-bold font-display text-white mb-1">NeoFit Premium</h1>
                    <p className="text-zinc-400 text-sm font-medium mb-6">Renews on Nov 24, 2023</p>
                    
                    <div className="flex items-baseline justify-center gap-1 mb-6">
                        <span className="text-4xl font-bold text-white tracking-tight">$14.99</span>
                        <span className="text-zinc-500 font-medium">/ month</span>
                    </div>

                    <div className="flex gap-3 justify-center">
                         <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <CreditCard size={12} /> {paymentMethods.find(m => m.isDefault)?.type} •••• {paymentMethods.find(m => m.isDefault)?.last4}
                         </div>
                         <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <Calendar size={12} /> Monthly
                         </div>
                    </div>
                </div>
            </div>

            {/* Features List */}
            <div className="mb-8">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 px-2">Plan Benefits</h3>
                <div className="space-y-3">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-[#1C1C1E] border border-white/5">
                            <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
                                <Check size={12} className="text-green-500" strokeWidth={3} />
                            </div>
                            <span className="text-sm font-medium text-zinc-200">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Other Options */}
            <div className="space-y-2">
                 <button 
                    onClick={() => setCurrentView('BILLING')}
                    className="w-full py-4 rounded-2xl bg-[#1C1C1E] border border-white/5 flex items-center justify-between px-5 group active:scale-[0.98] transition-all"
                 >
                     <span className="text-sm font-bold text-white">Billing History</span>
                     <ChevronRight size={18} className="text-zinc-600 group-hover:text-white transition-colors" />
                 </button>
                 <button 
                    onClick={() => setCurrentView('PAYMENT')}
                    className="w-full py-4 rounded-2xl bg-[#1C1C1E] border border-white/5 flex items-center justify-between px-5 group active:scale-[0.98] transition-all"
                 >
                     <span className="text-sm font-bold text-white">Payment Methods</span>
                     <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">{paymentMethods.length} Saved</span>
                        <ChevronRight size={18} className="text-zinc-600 group-hover:text-white transition-colors" />
                     </div>
                 </button>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-[#1C1C1E] border-t border-white/10 safe-area-bottom">
            <Button className="w-full bg-white text-black hover:bg-zinc-200 mb-3 rounded-[20px] h-14">
                Manage Subscription
            </Button>
            <button className="w-full py-3 text-xs font-bold text-red-500 hover:text-red-400 transition-colors">
                Cancel Subscription
            </button>
        </div>
    </motion.div>
  );

  const renderBilling = () => (
    <motion.div 
        key="billing"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col h-full bg-black w-full"
    >
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#1C1C1E] shrink-0 sticky top-0 z-20">
            <button onClick={() => setCurrentView('MAIN')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <ChevronLeft size={18} />
            </button>
            <h2 className="text-xl font-bold font-display text-white">Billing History</h2>
            <div className="w-8" /> 
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-black">
            {billingHistory.map((bill, i) => (
                <div key={i} className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-[#2C2C2E] transition-colors cursor-default">
                    <div>
                        <div className="text-white font-bold text-sm mb-1">{bill.date}</div>
                        <div className="text-zinc-500 text-xs font-medium">{bill.invoice} • NeoFit Premium</div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="text-white font-bold text-sm mb-1 tabular-nums">{bill.amount}</div>
                        <div className="text-green-500 text-[10px] font-bold uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded flex items-center gap-1 w-fit border border-green-500/20">
                            {bill.status}
                        </div>
                    </div>
                </div>
            ))}
            
            <div className="pt-4 text-center">
                <button className="text-xs font-bold text-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-2 w-full py-4">
                    <Download size={14} /> Download All Invoices
                </button>
            </div>
        </div>
    </motion.div>
  );

  const renderPayment = () => (
    <motion.div 
        key="payment"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col h-full bg-black w-full"
    >
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#1C1C1E] shrink-0 sticky top-0 z-20">
            <button onClick={() => setCurrentView('MAIN')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <ChevronLeft size={18} />
            </button>
            <h2 className="text-xl font-bold font-display text-white">Payment Method</h2>
            <div className="w-8" /> 
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-black">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 px-1">Saved Methods</h3>
            
            <div className="space-y-4 mb-8">
                {paymentMethods.map((method) => (
                    <div 
                        key={method.id}
                        onClick={() => toggleDefault(method.id)}
                        className={`bg-[#1C1C1E] p-5 rounded-2xl border flex items-center justify-between group cursor-pointer transition-all shadow-lg ${method.isDefault ? 'border-blue-500/50 shadow-blue-900/10' : 'border-white/10 hover:border-white/20'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-white rounded-md flex items-center justify-center shadow-sm relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-200" />
                                <span className="font-bold text-blue-800 text-xs italic relative z-10">{method.type}</span>
                            </div>
                            <div>
                                <div className="text-white font-bold text-sm flex items-center gap-2">
                                    {method.type} ending in {method.last4}
                                    {method.isDefault && <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] uppercase font-bold">Default</span>}
                                </div>
                                <div className="text-zinc-500 text-xs font-medium">Expires {method.expiry}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {method.isDefault ? (
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-[0_0_10px_rgba(10,132,255,0.4)]">
                                    <Check size={14} strokeWidth={3} />
                                </div>
                            ) : (
                                <button 
                                    onClick={(e) => deleteMethod(method.id, e)}
                                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={() => setCurrentView('ADD_PAYMENT')}
                className="w-full py-4 rounded-2xl border border-dashed border-white/20 flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:bg-white/5 transition-all group hover:border-white/40"
            >
                <Plus size={18} />
                <span className="text-sm font-bold">Add New Method</span>
            </button>
        </div>
    </motion.div>
  );

  const renderAddPayment = () => (
      <motion.div 
        key="add-payment"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col h-full bg-black w-full"
      >
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#1C1C1E] shrink-0 sticky top-0 z-20">
            <button onClick={() => setCurrentView('PAYMENT')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <ChevronLeft size={18} />
            </button>
            <h2 className="text-xl font-bold font-display text-white">Add Card</h2>
            <div className="w-8" /> 
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-black">
             {/* Card Preview */}
             <div className="relative h-48 rounded-[24px] bg-gradient-to-br from-zinc-800 to-black border border-white/10 p-6 mb-8 overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
                 <div className="flex flex-col justify-between h-full relative z-10">
                     <div className="flex justify-between items-start">
                         <div className="w-12 h-8 bg-white/10 rounded backdrop-blur-md flex items-center justify-center">
                            <CreditCard size={16} className="text-white/50" />
                         </div>
                         <span className="text-white/50 font-display font-bold italic text-lg">VISA</span>
                     </div>
                     <div>
                         <div className="text-xl font-display font-bold text-white tracking-widest mb-4 tabular-nums">
                             {cardNumber || '•••• •••• •••• ••••'}
                         </div>
                         <div className="flex justify-between items-end">
                             <div>
                                 <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Card Holder</div>
                                 <div className="text-sm font-bold text-zinc-300">{cardName || 'YOUR NAME'}</div>
                             </div>
                             <div>
                                 <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Expires</div>
                                 <div className="text-sm font-bold text-zinc-300 tabular-nums">{expiry || 'MM/YY'}</div>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>

             <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Name on Card</label>
                    <input 
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Alex Runner"
                        className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 text-white font-medium focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Card Number</label>
                    <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="0000 0000 0000 0000"
                            className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium focus:outline-none focus:border-blue-500/50 transition-colors tabular-nums"
                        />
                    </div>
                 </div>
                 <div className="flex gap-4">
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Expiry Date</label>
                        <input 
                            type="text"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 text-white font-medium focus:outline-none focus:border-blue-500/50 transition-colors tabular-nums"
                        />
                     </div>
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">CVC / CVV</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input 
                                type="text"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value)}
                                placeholder="123"
                                className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium focus:outline-none focus:border-blue-500/50 transition-colors tabular-nums"
                            />
                        </div>
                     </div>
                 </div>
             </div>
        </div>

        <div className="p-6 bg-[#1C1C1E] border-t border-white/10 safe-area-bottom">
            <Button onClick={handleAddPayment} isLoading={isProcessing} disabled={!cardNumber || !expiry} className="w-full bg-white text-black hover:bg-zinc-200 h-14 rounded-[20px] text-lg font-bold">
               {isProcessing ? 'Adding...' : 'Add Payment Method'}
            </Button>
        </div>
      </motion.div>
  );

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center pointer-events-none"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="pointer-events-auto bg-[#1C1C1E] w-full md:w-[500px] h-[90vh] md:h-[85vh] rounded-t-[32px] md:rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col border border-white/10"
      >
        <AnimatePresence mode="wait" initial={false}>
            {currentView === 'MAIN' && renderMain()}
            {currentView === 'BILLING' && renderBilling()}
            {currentView === 'PAYMENT' && renderPayment()}
            {currentView === 'ADD_PAYMENT' && renderAddPayment()}
        </AnimatePresence>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default SubscriptionModal;
