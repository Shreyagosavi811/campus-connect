import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import QueryCard from "./QueryCard";
import { motion, AnimatePresence } from "framer-motion";

export default function QueryList() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "queries"), orderBy("date_posted", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQueries(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching queries:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {queries.length === 0 ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-slate-400 italic">No queries posted yet.</motion.p>
        ) : (
          queries.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <QueryCard query={q} />
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
