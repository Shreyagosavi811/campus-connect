import React from 'react';

export default function Logo({ className = "h-8 w-auto" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Abstract "C" Connection Icon */}
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-sky-500 rounded-xl rotate-12 shadow-lg shadow-indigo-100 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101" />
          </svg>
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
