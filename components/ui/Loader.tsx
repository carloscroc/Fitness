import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-8 h-8 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Processing...</p>
    </div>
  );
};