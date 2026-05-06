import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-slate-50 z-[9999] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        {/* Animated Logo */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <Logo className="h-16 w-auto" />
        </motion.div>

        {/* Loading Progress Bar */}
        <div className="mt-8 w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-indigo-600"
            animate={{ 
              left: ["-100%", "100%"] 
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            style={{ width: "60%" }}
          />
        </div>

        {/* Waking up message (Subtle) */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest"
        >
          Connecting to Campus...
        </motion.p>
      </motion.div>
    </div>
  );
}
