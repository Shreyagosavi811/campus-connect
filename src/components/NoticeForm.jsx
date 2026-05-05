import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import classifyNotice from "../utils/classifyNotice";
import { uploadImageToImgBB } from "../utils/imageUpload";
import { motion, AnimatePresence } from "framer-motion";

const categories = ["Exam", "Placement", "Cultural", "Other"];
const departments = ["All", "Computer Engineering", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering"];
const years = ["All", "1st", "2nd", "3rd", "4th"];

export default function NoticeForm({ onAdded }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [autoCategory, setAutoCategory] = useState("");
  const [department, setDepartment] = useState("All");
  const [year, setYear] = useState("All");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null);
  const [showSnack, setShowSnack] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [userData, setUserData] = useState({ name: "", role: "", department: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          let userSnap;
          if (user.uid) {
            const docSnap = await getDoc(doc(db, "users", user.uid));
            if (docSnap.exists()) userSnap = docSnap.data();
          }
          if (!userSnap && user.email) {
            const q = query(collection(db, "users"), where("email", "==", user.email));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) userSnap = querySnap.docs[0].data();
          }
          if (userSnap) setUserData(userSnap);
          else setUserData({ name: user.displayName || user.email.split("@")[0], role: "User", department: "Unknown" });
        } catch (error) { console.error("Error fetching user data:", error); }
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (title || description) {
      const detected = classifyNotice(title + " " + description);
      setAutoCategory(detected);
    }
  }, [title, description]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = "";
      if (image) {
        setUploading(true);
        imageUrl = await uploadImageToImgBB(image);
        setUploading(false);
      }
      await addDoc(collection(db, "notices"), {
        title, description, category: category || autoCategory, department, year, imageUrl,
        postedBy: userData.name || user.displayName || user.email.split("@")[0],
        role: userData.role || "User",
        postedByDepartment: userData.department || "Unknown",
        pinned: isPinned,
        timestamp: serverTimestamp(),
      });
      setTitle(""); setDescription(""); setCategory(""); setAutoCategory(""); setDepartment("All"); setYear("All"); setImage(null); setIsPinned(false);
      setShowSnack(true);
      setTimeout(() => setShowSnack(false), 3000);
      if (onAdded) onAdded();
    } catch (err) { console.error("Error adding notice:", err); }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto mb-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -ml-16 -mt-16" />
        
        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
           <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xl">✍️</span>
           Create Announcement
        </h2>

        {autoCategory && (
          <div className="mb-6 p-3 bg-indigo-50 rounded-2xl flex items-center gap-2">
             <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">🤖 AI Suggestion:</span>
             <span className="text-xs font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-lg shadow-sm">{autoCategory}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Notice Title</label>
              <input 
                required
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-sm"
                placeholder="Important Announcement Name"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Description Content</label>
              <textarea 
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-sm resize-none"
                placeholder="Provide all relevant details here..."
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Category</label>
              <select 
                value={category || autoCategory} 
                onChange={e => setCategory(e.target.value)}
                className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none"
              >
                {[autoCategory, ...categories].filter((v, i, arr) => v && arr.indexOf(v) === i).map(cat => (
                  <option key={cat} value={cat}>{cat === autoCategory ? `🤖 ${cat}` : cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Dept</label>
                  <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none">
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Year</label>
                  <select value={year} onChange={e => setYear(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
               </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4">
             <button 
               type="button"
               onClick={() => setIsPinned(!isPinned)}
               className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${isPinned ? 'bg-amber-100 text-amber-700 shadow-lg shadow-amber-50' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'}`}
             >
                {isPinned ? "📌 Pinned to Top" : "Pin Announcement"}
             </button>
             
             <label className="flex-1 py-4 bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100 hover:text-indigo-600 cursor-pointer rounded-2xl font-black uppercase text-[10px] tracking-widest text-center transition-all">
                {image ? `Image: ${image.name.slice(0, 10)}...` : "Attach Media"}
                <input type="file" hidden accept="image/*" onChange={e => setImage(e.target.files[0])} />
             </label>
          </div>

          {(loading || uploading) && (
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2, repeat: Infinity }} className="h-full bg-indigo-600" />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || uploading}
            className="w-full py-5 bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? "Transmitting..." : "Broadcast Notice"}
          </button>
        </form>

        <AnimatePresence>
          {showSnack && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-emerald-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-2xl z-[100]"
            >
              ✅ Broadcast Successful!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}