
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'brand' | 'success';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyle = "relative font-sans font-semibold text-[15px] py-3.5 px-6 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center tracking-tight";
  
  const variants = {
    // Primary: White background, Black text (High Emphasis in Dark Mode)
    // Forced !text-black ensures visibility regardless of parent context
    primary: "bg-white !text-black shadow-sm hover:bg-gray-200 border-none",
    // Secondary: Dark Gray background, White text (Medium Emphasis)
    secondary: "bg-[#2C2C2E] text-white border border-white/10 hover:bg-[#3A3A3C]",
    // Brand: Blue background, White text
    brand: "bg-[#0A84FF] text-white shadow-[0_0_20px_rgba(10,132,255,0.3)] hover:bg-[#0077ED]",
    // Success: Green background, White text
    success: "bg-[#30D158] text-white shadow-[0_0_20px_rgba(48,209,88,0.3)] hover:bg-[#28B84B]",
    // Ghost: Transparent background
    ghost: "bg-transparent text-white hover:bg-white/10",
    // Danger: Red tint
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
  };

  return (
    <motion.button
      className={`${baseStyle} ${variants[variant]} ${isLoading ? 'cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading && (
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && children}
      </div>
    </motion.button>
  );
};
