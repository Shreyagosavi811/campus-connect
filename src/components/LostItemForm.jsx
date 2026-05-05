import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { uploadImageToImgBB } from "../utils/imageUpload";
import { motion, AnimatePresence } from "framer-motion";

const LostItemForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = "";
      if (image) imageUrl = await uploadImageToImgBB(image);
      await addDoc(collection(db, "lost_items"), {
        title, description, category, location, imageUrl,
        date_reported: serverTimestamp(),
        status: "lost",
      });
      setTitle(""); setDescription(""); setCategory(""); setLocation(""); setImage(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) { console.error("Error adding document: ", error); }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
           <span className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center text-xl">🔍</span>
           Report a Lost Item
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Item Name</label>
              <input 
                required
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 transition-all font-medium text-sm"
                placeholder="Black Wallet, Blue Bag..."
              />
            </div>
            
            <div className="md:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Category</label>
              <input 
                required
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 transition-all font-medium text-sm"
                placeholder="Electronics, Stationery..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Last Seen Location</label>
              <input 
                required
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 transition-all font-medium text-sm"
                placeholder="Library 2nd Floor, Cafeteria..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Detailed Description</label>
              <textarea 
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 transition-all font-medium text-sm resize-none"
                placeholder="Any identifying marks, contents, or specifics..."
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4">
             <label className="flex-1 py-4 bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100 hover:text-rose-500 cursor-pointer rounded-2xl font-black uppercase text-[10px] tracking-widest text-center transition-all">
                {image ? `Photo: ${image.name.slice(0, 15)}...` : "Attach Item Photo"}
                <input type="file" hidden accept="image/*" onChange={e => setImage(e.target.files[0])} />
             </label>
             
             <button 
               type="submit" 
               disabled={loading}
               className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-3"
             >
                {loading ? "Reporting..." : "Submit Report"}
             </button>
          </div>
        </form>

        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-rose-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-2xl z-[100]"
            >
              🚩 Report Submitted Successfully!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LostItemForm;
