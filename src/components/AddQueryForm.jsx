import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; 
import { suggestCategory } from "../ml/smartTagger";
import { motion, AnimatePresence } from "framer-motion";

export default function AddQueryForm({ onPosted }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [postedBy, setPostedBy] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setPostedBy("");
  };

  const handleAutoTag = () => {
    if (!title && !description) {
      setMessage("Enter details first for auto-tagging.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    const suggested = suggestCategory(title, description);
    if (suggested) {
      setCategory(suggested);
      setMessage(`Suggested category: ${suggested} ✨`);
    } else {
      setMessage("Could not find a matching category.");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setMessage("Please add a title and description.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const docRef = await addDoc(collection(db, "queries"), {
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || "General",
        postedBy: postedBy.trim() || "Anonymous",
        date_posted: serverTimestamp(), 
        status: "open", 
      });
      if (onPosted) onPosted({ id: docRef.id, title: title.trim() });
      setMessage("Query broadcast successfully! ✅");
      resetForm();
    } catch (err) {
      console.error("Error adding query:", err);
      setMessage("Failed to post. Please try again.");
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
           <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xl">💡</span>
           Ask the Community
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Quick Headline</label>
              <input 
                required
                type="text"
                maxLength={120}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-sm"
                placeholder="What is your question about?"
              />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Full Context</label>
              <textarea 
                required
                rows={5}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-sm resize-none"
                placeholder="Explain the background and exactly what you need help with..."
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-grow">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Tag/Category</label>
                <input 
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all font-medium text-sm"
                  placeholder="e.g. Physics, Placement, Clubs"
                />
              </div>
              <button 
                type="button" 
                onClick={handleAutoTag}
                className="px-6 py-3 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-100"
              >
                Auto Tag ✨
              </button>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Your Identity (Optional)</label>
              <input 
                type="text"
                value={postedBy}
                onChange={e => setPostedBy(e.target.value)}
                className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all font-medium text-sm"
                placeholder="Leave blank for Anonymous"
              />
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? "Transmitting..." : "Broadcast Question"}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className={`mt-6 p-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
