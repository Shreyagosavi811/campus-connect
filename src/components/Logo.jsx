import React from 'react';

export default function Logo({ className = "h-8 w-auto" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Abstract "C" Connection Icon */}
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
          <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
        </div>
        {/* Animated Glow */}
        <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-lg opacity-20 animate-pulse" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-black text-slate-900 leading-none tracking-tighter uppercase">
          Campus<span className="text-indigo-600">Connect</span>
        </span>
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mt-1 ml-0.5">
          Academic Ecosystem
        </span>
      </div>
    </div>
  );
}
