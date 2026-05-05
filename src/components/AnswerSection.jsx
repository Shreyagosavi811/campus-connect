import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function AnswerSection({ queryId }) {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, `queries/${queryId}/replies`), {
        text: text.trim(),
        repliedBy: name.trim() || "Anonymous",
        time: serverTimestamp(),
      });
      setText("");
      setName("");
    } catch (err) {
      console.error("Reply failed:", err);
    }
    setLoading(false);
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleReply}>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          placeholder="Anonymous"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-shrink-0 w-full sm:w-32 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-600 transition-all text-xs font-bold"
        />
        <div className="relative flex-grow">
          <input
            required
            placeholder="Type your response..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full pl-4 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-xs font-medium"
          />
          <button 
            type="submit" 
            disabled={loading || !text.trim()} 
            className="absolute right-1 top-1 bottom-1 px-4 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-black transition-all active:scale-95"
          >
            {loading ? "..." : "Reply"}
          </button>
        </div>
      </div>
    </form>
  );
}
