import React, { useState } from "react";
import LostItemForm from "../components/LostItemForm";
import LostItemsList from "../components/LostItemsList";
import FoundItemForm from "../components/FoundItemForm";
import FoundItemsList from "../components/FoundItemsList";
import { motion, AnimatePresence } from "framer-motion";

const LostFoundPage = () => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2">
          Lost & <span className="text-indigo-600">Found</span>
        </h1>
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">Campus Recovery Network</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex justify-center mb-10">
         <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-2">
            {[
              { label: "Lost Items", idx: 0, icon: "🔍" },
              { label: "Found Items", idx: 1, icon: "🎁" }
            ].map(tab => (
              <button 
                key={tab.idx} 
                onClick={() => setTabValue(tab.idx)}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center gap-2 ${
                  tabValue === tab.idx ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
         </div>
      </div>

      {/* Tab Panels */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {tabValue === 0 ? (
            <motion.div 
              key="lost"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <LostItemForm />
              <div className="mt-12">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8 flex items-center gap-2">
                  <span className="w-2 h-8 bg-rose-500 rounded-full" />
                  Reported Lost Items
                </h3>
                <LostItemsList />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="found"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <FoundItemForm />
              <div className="mt-12">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8 flex items-center gap-2">
                  <span className="w-2 h-8 bg-emerald-500 rounded-full" />
                  Recent Findings
                </h3>
                <FoundItemsList />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LostFoundPage;
