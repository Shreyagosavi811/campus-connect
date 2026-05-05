import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";

export default function QuestionForm({ userData, onAdded }) {
  const [question, setQuestion] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    await addDoc(collection(db, "mentorshipQuestions"), {
      question,
      askedBy: userData.name || userData.uid,
      department: userData.department,
      year: userData.year,
      date: serverTimestamp(),
      answers: []
    });

    setQuestion("");
    if (onAdded) onAdded();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100 mb-12 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl -mr-12 -mt-12" />
      
      <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
         <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm">🙋‍♂️</span>
         Ask for Mentorship
      </h2>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
        <textarea
          required
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="I need advice on..."
          className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-sm resize-none"
        />
        <div className="flex justify-end">
           <button 
             type="submit" 
             className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
           >
              Post Question
           </button>
        </div>
      </form>
    </motion.div>
  );
}
