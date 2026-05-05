import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import emailjs from "emailjs-com";
import { motion, AnimatePresence } from "framer-motion";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-md z-10 p-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter">{title}</h2>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function TeacherUserManagement() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", year: "" });
  const [tabIndex, setTabIndex] = useState(0);
  const [editStudent, setEditStudent] = useState(null);
  const [yearFilter, setYearFilter] = useState("");

  const years = ["1", "2", "3", "4"];
  const API = "http://localhost:8080/api/users";

  const fetchStudents = async () => {
    if (!user?.department) return;
    try {
      const res = await axios.get(API);
      const deptStudents = res.data.filter(u => 
        u.department === user.department && u.role === "STUDENT"
      );
      setStudents(deptStudents);
    } catch (error) { console.error("Failed to fetch students:", error); }
  };

  useEffect(() => { fetchStudents(); }, [user]);

  const highlight = (text) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text?.split(regex).map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? <span key={i} className="bg-amber-200 text-amber-900 px-0.5 rounded">{part}</span> : part
    );
  };

  const applyFilters = (list) => {
    return list.filter(s => {
      const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
      const matchYear = yearFilter ? s.year === yearFilter : true;
      return matchSearch && matchYear;
    });
  };

  const handleAddStudent = async () => {
    if (!form.name || !form.email || !form.year) return alert("All fields required");
    const password = Math.random().toString(36).slice(-8);
    try {
      await axios.post(API, { ...form, role: "STUDENT", department: user.department, approved: false, password });
      emailjs.send("service_ydtu7jp", "template_etypntv", { name: form.name, email: form.email, password }, "NN3gMWSv34ggrAvsV");
      setForm({ name: "", email: "", year: "" });
      fetchStudents();
    } catch (error) { console.error("Failed to add student:", error); }
  };

  const handleUpdate = async () => {
    if (!editStudent) return;
    try {
      await axios.put(`${API}/${editStudent.id}`, editStudent);
      setEditStudent(null);
      fetchStudents();
    } catch (error) { console.error("Failed to update student:", error); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete student?")) {
      try { await axios.delete(`${API}/${id}`); fetchStudents(); } catch (error) { console.error("Failed to delete student:", error); }
    }
  };

  const handleApprove = async (id) => {
    try { await axios.put(`${API}/${id}/approve`); fetchStudents(); } catch (error) { console.error("Failed to approve student:", error); }
  };

  const approvedStudents = applyFilters(students.filter(s => s.approved));
  const pendingStudents = applyFilters(students.filter(s => !s.approved));
  const filteredStudents = [approvedStudents, pendingStudents];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">
           Student <span className="text-indigo-600">Roster</span>
        </h1>
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">Faculty Control Panel • {user?.department}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Search & Filters */}
        <div className="lg:col-span-4">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-28 space-y-8">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Quick <span className="text-indigo-600">Actions</span></h2>
              
              <div className="space-y-4">
                <input 
                  placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm font-medium"
                />
                <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none">
                   <option value="">All Academic Years</option>
                   {years.map(y => <option key={y} value={y}>{y} Year</option>)}
                </select>
              </div>

              <div className="pt-8 border-t border-slate-50">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Enroll New Student</h3>
                <div className="space-y-3">
                   <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium" />
                   <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium" />
                   <select value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none">
                      <option value="">Year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                   </select>
                   <button onClick={handleAddStudent} className="w-full py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-black transition-all active:scale-95">Enroll Student</button>
                </div>
              </div>
           </div>
        </div>

        {/* Right: Lists */}
        <div className="lg:col-span-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 mb-8 w-fit mx-auto md:mx-0">
                 {[`Approved (${approvedStudents.length})`, `Pending (${pendingStudents.length})`].map((t, i) => (
                    <button key={i} onClick={() => setTabIndex(i)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tabIndex === i ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                       {t}
                    </button>
                 ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <AnimatePresence mode="popLayout">
                    {filteredStudents[tabIndex].length === 0 ? (
                       <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-20 text-center text-slate-400 italic">No students found matching filters.</motion.div>
                    ) : (
                       filteredStudents[tabIndex].map((s, idx) => (
                          <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }} key={s.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xs">
                                   {s.name ? s.name[0] : "S"}
                                </div>
                                <div>
                                   <h3 className="font-black text-slate-800 tracking-tight leading-none">{highlight(s.name)}</h3>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Year {s.year}</p>
                                </div>
                             </div>
                             <p className="text-slate-500 text-[10px] font-bold mb-6 truncate">{highlight(s.email)}</p>
                             
                             <div className="flex gap-2 border-t border-slate-100 pt-4">
                                {!s.approved && <button onClick={() => handleApprove(s.id)} className="flex-1 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg">Approve</button>}
                                <button onClick={() => setEditStudent(s)} className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg">Edit</button>
                                <button onClick={() => handleDelete(s.id)} className="flex-1 py-2 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-lg">Delete</button>
                             </div>
                          </motion.div>
                       ))
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>

      <Modal open={!!editStudent} onClose={() => setEditStudent(null)} title="Update Student Profile">
         {editStudent && (
           <div className="space-y-4">
              {["name", "email", "year"].map(field => (
                <div key={field}>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">{field}</label>
                   <input value={editStudent[field] || ""} onChange={e => setEditStudent({ ...editStudent, [field]: e.target.value })} className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm font-medium" />
                </div>
              ))}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                 <input type="checkbox" id="approved" checked={editStudent?.approved || false} onChange={e => setEditStudent({ ...editStudent, approved: e.target.checked })} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600" />
                 <label htmlFor="approved" className="text-xs font-black text-slate-600 uppercase tracking-widest">Mark as Approved</label>
              </div>
              <div className="flex gap-3 pt-6">
                 <button onClick={() => setEditStudent(null)} className="flex-1 py-4 text-slate-500 font-black uppercase text-xs hover:bg-slate-50 rounded-2xl transition-colors">Cancel</button>
                 <button onClick={handleUpdate} className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-xl transition-all active:scale-95">Save Changes</button>
              </div>
           </div>
         )}
      </Modal>
    </div>
  );
}