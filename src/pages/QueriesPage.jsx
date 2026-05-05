import React, { useState } from "react";
import AddQueryForm from "../components/AddQueryForm";
import QueryList from "../components/QueryList";
import { motion, AnimatePresence } from "framer-motion";

export default function QueriesPage() {
  const [view, setView] = useState("list"); // 'form' or 'list'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2">
          Mentorship <span className="text-indigo-600">Queries</span>
        </h1>
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">Direct Academic Support</p>
      </motion.div>

      <div className="flex justify-center mb-10">
         <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-2">
            {[
              { id: "list", label: "View Queries", icon: "💬" },
              { id: "form", label: "New Query", icon: "➕" }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setView(tab.id)}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center gap-2 ${
                  view === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
         </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {view === "form" ? <AddQueryForm /> : <QueryList />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
