import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import QuestionForm from "../components/QuestionForm";
import { motion, AnimatePresence } from "framer-motion";

export default function Mentorship({ userData }) {
  const [questions, setQuestions] = useState([]);
  const [answerInputs, setAnswerInputs] = useState({});

  const fetchQuestions = async () => {
    const snapshot = await getDocs(collection(db, "mentorshipQuestions"));
    setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    if (userData) fetchQuestions();
  }, [userData]);

  const handleAnswerChange = (qId, value) => {
    setAnswerInputs(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmitAnswer = async (qId) => {
    const answerText = answerInputs[qId];
    if (!answerText || !userData) return;

    const qDoc = doc(db, "mentorshipQuestions", qId);
    await updateDoc(qDoc, {
      answers: arrayUnion({
        answeredBy: userData.name || userData.uid,
        answer: answerText,
        date: new Date().toISOString()
      })
    });

    setAnswerInputs(prev => ({ ...prev, [qId]: "" }));
    fetchQuestions();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2">
          Mentorship <span className="text-indigo-600">Circle</span>
        </h1>
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">Guidance & Career Development</p>
      </motion.div>

      {userData && userData.role?.toLowerCase() === "student" && (
        <QuestionForm userData={userData} onAdded={fetchQuestions} />
      )}

      <div className="space-y-8 mt-12">
        <AnimatePresence mode="popLayout">
          {questions.map((q, idx) => (
            <motion.div
              layout
              key={q.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{q.question}</h3>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[10px] font-black uppercase tracking-widest">{q.department} • {q.year}</span>
              </div>
              
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Asked by: <span className="text-slate-600">{q.askedBy}</span></p>

              <div className="space-y-4 mb-8">
                {q.answers?.map((a, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 border-l-4 border-l-indigo-500">
                    <p className="text-sm text-slate-600 font-medium mb-2 leading-relaxed">{a.answer}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">— {a.answeredBy}</p>
                  </div>
                ))}
              </div>

              {userData && ["teacher", "hod", "admin"].includes(userData.role?.toLowerCase()) && (
                <div className="pt-6 border-t border-slate-50 flex flex-col md:flex-row gap-3">
                  <input
                    placeholder="Provide professional guidance..."
                    value={answerInputs[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="flex-grow px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-medium"
                  />
                  <button 
                    onClick={() => handleSubmitAnswer(q.id)}
                    className="px-8 py-3 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-100"
                  >
                    Submit Advice
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
