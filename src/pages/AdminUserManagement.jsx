import emailjs from "emailjs-com";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-md z-10 p-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6">{title}</h2>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", role: "Student", department: "", year: "" });
  const [tabIndex, setTabIndex] = useState(0);
  const [editUser, setEditUser] = useState(null);

  const API_USERS = "http://localhost:8080/api/users";

  const fetchData = async () => {
    try {
      const uRes = await axios.get(API_USERS);
      setUsers(uRes.data);
    } catch (e) { console.error("Fetch error:", e); }
  };

  useEffect(() => { fetchData(); }, []);

  const highlight = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text?.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? <span key={i} className="bg-amber-200 text-amber-900 px-0.5 rounded">{part}</span> : part
    );
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.role || !form.department) return alert("Fields missing");
    const password = Math.random().toString(36).slice(-8);
    try {
      await axios.post(API_USERS, { ...form, role: form.role.toUpperCase(), password, approved: false });
      emailjs.send("service_ydtu7jp", "template_etypntv", { name: form.name, email: form.email, password }, "NN3gMWSv34ggrAvsV");
      setForm({ name: "", email: "", role: "Student", department: "", year: "" });
      fetchData();
    } catch (e) { alert("Error adding user"); }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_USERS}/${editUser.id}`, editUser);
      setEditUser(null);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleApprove = async (id) => {
    try { await axios.put(`${API_USERS}/${id}/approve`); fetchData(); } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete user?")) {
      try { await axios.delete(`${API_USERS}/${id}`); fetchData(); } catch (e) { console.error(e); }
    }
  };

  const tabs = ["HODs", "Teachers", "Students", "Approvals"];
  const filteredData = [
    users.filter(u => u.role?.toUpperCase() === "HOD"),
    users.filter(u => u.role?.toUpperCase() === "TEACHER"),
    users.filter(u => u.role?.toUpperCase() === "STUDENT"),
    users.filter(u => !u.approved)
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Add User Form */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-28">
            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Add New <span className="text-indigo-600">User</span></h2>
            <div className="space-y-4">
              {[
                { label: "Full Name", key: "name", type: "text", placeholder: "John Doe" },
                { label: "Email Address", key: "email", type: "email", placeholder: "john@university.edu" },
                { label: "Department", key: "department", type: "text", placeholder: "Computer Science" }
              ].map(field => (
                <div key={field.key}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">{field.label}</label>
                  <input 
                    type={field.type}
                    value={form[field.key]}
                    onChange={e => setForm({...form, [field.key]: e.target.value})}
                    placeholder={field.placeholder}
                    className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-medium"
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-medium"
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="HOD">HOD</option>
                </select>
              </div>
              <button 
                onClick={handleAdd}
                className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: User Management Tabs */}
        <div className="lg:col-span-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto w-full md:w-auto">
                {tabs.map((t, i) => (
                  <button 
                    key={i} 
                    onClick={() => setTabIndex(i)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight whitespace-nowrap transition-all ${
                      tabIndex === i ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="Quick search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-medium"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredData[tabIndex]
                  .filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
                  .map((u, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: idx * 0.05 }}
                      key={u.id}
                      className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-slate-800 tracking-tight">{highlight(u.name, search)}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${u.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {u.approved ? "Approved" : "Pending"}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs font-medium mb-6 break-all">{u.email}</p>
                      <div className="flex items-center gap-2 mb-6">
                        <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-500 rounded text-[10px] font-black uppercase">{u.role}</span>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-500 rounded text-[10px] font-black uppercase truncate max-w-[100px]">{u.department}</span>
                      </div>
                      
                      <div className="flex gap-2">
                         {!u.approved && (
                           <button onClick={() => handleApprove(u.id)} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg transition-colors">Approve</button>
                         )}
                         <button onClick={() => setEditUser(u)} className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg hover:bg-slate-50 transition-colors">Edit</button>
                         <button onClick={() => handleDelete(u.id)} className="flex-1 py-2 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-lg hover:bg-rose-100 transition-colors">Delete</button>
                      </div>
                    </motion.div>
                  ))
                }
              </AnimatePresence>
              {filteredData[tabIndex].length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 italic text-sm">
                  No users found in this category.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Modify User Account">
        {editUser && (
          <div className="space-y-4">
             {["name", "email", "department"].map(f => (
               <div key={f}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">{f}</label>
                  <input 
                    type="text"
                    value={editUser[f] || ""}
                    onChange={e => setEditUser({...editUser, [f]: e.target.value})}
                    className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm font-medium"
                  />
               </div>
             ))}
             <div className="flex gap-3 pt-6">
                <button onClick={() => setEditUser(null)} className="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl transition-colors">Cancel</button>
                <button onClick={handleUpdate} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95">Save Changes</button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
}