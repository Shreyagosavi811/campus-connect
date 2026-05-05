import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border
                ${toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800' : 
                  toast.type === 'error' ? 'bg-rose-50/90 border-rose-100 text-rose-800' : 
                  toast.type === 'warning' ? 'bg-amber-50/90 border-amber-100 text-amber-800' : 
                  'bg-white/90 border-slate-100 text-slate-800'}
              `}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg shadow-inner
                  ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
                    toast.type === 'error' ? 'bg-rose-100 text-rose-600' : 
                    toast.type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                    'bg-slate-100 text-slate-500'}
                `}>
                  {toast.type === 'success' && '✓'}
                  {toast.type === 'error' && '✕'}
                  {toast.type === 'warning' && '!'}
                  {toast.type === 'info' && 'i'}
                </div>
                <p className="text-sm font-black uppercase tracking-tight">{toast.message}</p>
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
