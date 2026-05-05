import React, { useEffect, useState } from "react";
import { doc, collection, onSnapshot, query, orderBy, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import AnswerSection from "./AnswerSection";
import { motion, AnimatePresence } from "framer-motion";

export default function QueryCard({ query: queryData, onNotify }) {
  if (!queryData || typeof queryData !== "object") return null;
  const { id, title, description, category, postedBy, date_posted, status } = queryData;
  if (!id) return null;

  const [replies, setReplies] = useState([]);
  const [localStatus, setLocalStatus] = useState(status || "open");

  useEffect(() => {
    if (!id) return;
    const repliesRef = query(collection(db, `queries/${id}/replies`), orderBy("time", "asc"));
    const unsub = onSnapshot(
      repliesRef,
      (snapshot) => {
        const docs = [];
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && onNotify) {
            onNotify({ type: "reply", message: `New reply on: ${title}` });
          }
        });
        snapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));
        setReplies(docs);
      },
      (err) => console.error("Replies listener error:", err)
    );
    return () => unsub();
  }, [id, onNotify, title]);

  const toggleResolved = async () => {
    try {
      const docRef = doc(db, "queries", id);
      const newStatus = localStatus === "open" ? "resolved" : "open";
      await updateDoc(docRef, { status: newStatus });
      setLocalStatus(newStatus);
    } catch (err) { console.error("Failed to toggle status:", err); }
  };

  return (
    <motion.div 
      layout
      className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300"
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{title || "Untitled Query"}</h3>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${localStatus === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
            {localStatus}
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6 text-slate-400">
          <div className="flex items-center gap-1.5">
             <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                {postedBy ? postedBy[0] : "A"}
             </div>
             <span className="text-xs font-bold text-slate-600">{postedBy || "Anonymous"}</span>
          </div>
          <span className="w-1 h-1 bg-slate-200 rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded text-slate-500">{category || "General"}</span>
          <span className="w-1 h-1 bg-slate-200 rounded-full" />
          <span className="text-[10px] font-bold uppercase tracking-tight">
            {date_posted?.seconds ? new Date(date_posted.seconds * 1000).toLocaleDateString() : ""}
          </span>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm font-medium leading-relaxed mb-8 border-l-4 border-slate-100 pl-4">{description || "No description provided."}</p>

        {/* Replies Section */}
        <div className="space-y-4 mb-8">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
             Responses ({replies.length})
          </h4>
          <AnimatePresence mode="popLayout">
            {replies.length === 0 ? (
              <p className="text-xs font-medium text-slate-400 italic">No replies yet — be the first to help.</p>
            ) : (
              replies.map((r) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  key={r.id} 
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-100"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-slate-700">{r.repliedBy || "Anonymous"}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {r.time?.seconds ? new Date(r.time.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{r.text}</p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-6 border-t border-slate-50">
           <button 
             onClick={toggleResolved} 
             className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
               localStatus === 'open' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
             }`}
           >
             {localStatus === "open" ? "Mark Resolved ✓" : "Re-open Query ↩"}
           </button>
           
           <div className="w-full sm:flex-1 sm:max-w-md">
              <AnswerSection queryId={id} />
           </div>
        </div>
      </div>
    </motion.div>
  );
}
