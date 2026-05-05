import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import NoticeForm from "../components/NoticeForm";
import { uploadImageToImgBB } from "../utils/imageUpload";
import { NoticeSkeleton } from "../components/Skeletons";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-lg z-10">
           <div className="p-8">
             <h2 className="text-2xl font-black text-slate-900 mb-6">{title}</h2>
             {children}
           </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function NoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [editOpen, setEditOpen] = useState(false);
  const [editNotice, setEditNotice] = useState(null);
  const [saving, setSaving] = useState(false);

  const role = user?.role?.trim().toUpperCase();
  const canEdit = ["ADMIN", "HOD", "TEACHER"].includes(role);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "notices"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      data.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });

      setNotices(data);
      setFilteredNotices(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, []);

  useEffect(() => {
    let filtered = [...notices];
    if (selectedDept !== "All") filtered = filtered.filter((n) => n.department === selectedDept);
    if (selectedYear !== "All") filtered = filtered.filter((n) => n.year === selectedYear);
    if (selectedCategory !== "All") filtered = filtered.filter((n) => n.category === selectedCategory);
    setFilteredNotices(filtered);
  }, [selectedDept, selectedYear, selectedCategory, notices]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    await deleteDoc(doc(db, "notices", id));
    fetchNotices();
  };

  const handleEditOpen = (n) => {
    setEditNotice({ ...n });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editNotice?.id) return;
    setSaving(true);
    try {
      let imageUrl = editNotice.imageUrl;
      if (editNotice.newImage) imageUrl = await uploadImageToImgBB(editNotice.newImage);
      const { newImage, ...updateData } = editNotice;
      await updateDoc(doc(db, "notices", editNotice.id), { ...updateData, imageUrl });
      setEditOpen(false);
      fetchNotices();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2">
          Notice <span className="text-indigo-600">Board</span>
        </h1>
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">Official Announcements & Updates</p>
      </motion.div>

      {canEdit && <NoticeForm onAdded={fetchNotices} />}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-10 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Dept", value: selectedDept, setter: setSelectedDept, options: ["All", "Computer Engineering", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering"] },
            { label: "Year", value: selectedYear, setter: setSelectedYear, options: ["All", "1st", "2nd", "3rd", "4th"] },
            { label: "Category", value: selectedCategory, setter: setSelectedCategory, options: ["All", "Exam", "Placement", "Cultural", "Urgent", "General"] }
          ].map(filter => (
            <div key={filter.label} className="flex items-center gap-2">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{filter.label}:</span>
               <select 
                 value={filter.value} 
                 onChange={e => filter.setter(e.target.value)}
                 className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-indigo-600 transition-colors"
               >
                 {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
               </select>
            </div>
          ))}
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
           Showing {filteredNotices.length} notices
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
           {[1, 2, 3].map(i => <NoticeSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredNotices.map((n, idx) => (
              <motion.div
                layout
                key={n.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-300"
              >
                {n.imageUrl && (
                  <div className="h-48 overflow-hidden relative">
                     <img src={n.imageUrl} alt={n.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{n.title}</h3>
                    {n.pinned && <span className="text-xl" title="Pinned">📌</span>}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${n.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>{n.priority}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase">{n.category}</span>
                  </div>

                  <p className="text-slate-500 text-sm font-medium mb-8 flex-1 leading-relaxed line-clamp-4">{n.description}</p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Posted By</span>
                       <span className="text-xs font-bold text-slate-800">{n.postedBy}</span>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <button onClick={() => handleEditOpen(n)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M18.364 5.636a9 9 0 010 12.728m0 0l-1.364-1.364m1.364 1.364l1.364-1.364M9 15h3l8.5-8.5a2.121 2.121 0 00-3-3L9 12v3z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(n.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Modify Announcement">
        {editNotice && (
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Title</label>
                <input 
                  type="text"
                  value={editNotice.title}
                  onChange={e => setEditNotice({...editNotice, title: e.target.value})}
                  className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm font-medium"
                />
             </div>
             <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Description</label>
                <textarea 
                  rows={4}
                  value={editNotice.description}
                  onChange={e => setEditNotice({...editNotice, description: e.target.value})}
                  className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm font-medium resize-none"
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Category</label>
                  <select 
                    value={editNotice.category} 
                    onChange={e => setEditNotice({...editNotice, category: e.target.value})}
                    className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none"
                  >
                    <option value="Exam">Exam</option>
                    <option value="Placement">Placement</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Priority</label>
                  <select 
                    value={editNotice.priority} 
                    onChange={e => setEditNotice({...editNotice, priority: e.target.value})}
                    className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
             </div>
             <div className="flex gap-4 items-center pt-4">
                <button 
                  onClick={() => setEditNotice({...editNotice, pinned: !editNotice.pinned})}
                  className={`flex-1 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${editNotice.pinned ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}
                >
                  {editNotice.pinned ? "Pinned 📌" : "Pin to Top"}
                </button>
                <label className="flex-1 py-3 bg-slate-100 text-slate-400 hover:text-indigo-600 cursor-pointer rounded-2xl font-black uppercase text-[10px] tracking-widest text-center transition-all">
                  {editNotice.newImage ? "Image Selected ✓" : "Change Image"}
                  <input type="file" hidden onChange={e => setEditNotice({...editNotice, newImage: e.target.files[0]})} />
                </label>
             </div>
             <div className="flex gap-3 pt-6 border-t border-slate-50">
                <button onClick={() => setEditOpen(false)} className="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl transition-colors">Cancel</button>
                <button onClick={handleSaveEdit} disabled={saving} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95">
                  {saving ? "Updating..." : "Save Changes"}
                </button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
}