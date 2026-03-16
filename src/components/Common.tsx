import React from 'react';
import { cn } from '../lib/utils';

export const Button = ({ children, className, variant = 'primary', ...props }: any) => {
  const variants = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-200',
    secondary: 'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50',
    ghost: 'bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200',
  };
  return (
    <button 
      className={cn(
        'px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50',
        variants[variant as keyof typeof variants],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ label, icon: Icon, ...props }: any) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">{label}</label>}
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={16} />}
      <input 
        className={cn(
          "w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-3 px-4 text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all",
          Icon && "pl-11"
        )}
        {...props}
      />
    </div>
  </div>
);
