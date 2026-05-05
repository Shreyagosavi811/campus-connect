import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function EventForm({ onAdded }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !date || !time || !location) return alert("All fields required");
    setLoading(true);
    try {
      await addDoc(collection(db, "events"), {
        title, description, category, date, time, location,
        postedBy: user?.name || "Admin",
        role: user?.role || "UNKNOWN",
        registrations: [],
        timestamp: serverTimestamp(),
      });
      setTitle(""); setDescription(""); setCategory("Technical"); setDate(""); setTime(""); setLocation("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      if (onAdded) onAdded();
    } catch (error) { console.error("Error adding document: ", error); }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto mb-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
           <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xl">📅</span>
           Host a New Event
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Event Title</label>
              <input 
                required
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-sm"
                placeholder="Symposium 2024"
              />
            </div>
            
            <div className="md:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Category</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none"
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Workshop">Workshop</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-3 md:col-span-2 gap-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Date</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none" />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Time</label>
                  <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none" />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Location</label>
                  <input type="text" required value={location} onChange={e => setLocation(e.target.value)} placeholder="Auditorium" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none" />
               </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Event Description</label>
              <textarea 
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-sm resize-none"
                placeholder="What is this event about?"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? "Publishing..." : "Launch Event"}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-emerald-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-2xl z-[100]"
            >
              🚀 Event Published!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
