import { useEffect, useState } from "react";
import emailjs from "emailjs-com";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
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

export default function HodUserManagement() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [fees, setFees] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", role: "STUDENT", year: "" });
  const [tabIndex, setTabIndex] = useState(0);
  const [editUser, setEditUser] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [feeForm, setFeeForm] = useState({ totalFees: "", paidFees: "" });

  const API_USERS = "/api/users";
  const API_FEES = "/api/fees";

  const fetchData = async () => {
    try {
      const [uRes, fRes] = await Promise.all([
        api.get(API_USERS),
        api.get(API_FEES)
      ]);
      const deptUsers = uRes.data.filter(u => u.department?.toLowerCase() === user?.department?.toLowerCase());
      setUsers(deptUsers);
      setFees(fRes.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const highlight = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text?.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? <span key={i} className="bg-amber-200 text-amber-900 px-0.5 rounded">{part}</span> : part
    );
  };

  const handleAddUser = async () => {
    if (!form.name || !form.email) return addToast("Please fill all required fields", "warning");
    const password = Math.random().toString(36).slice(-8);
    try {
      await api.post(API_USERS, { ...form, department: user.department, password, approved: false });
      emailjs.send("service_ydtu7jp", "template_etypntv", { name: form.name, email: form.email, password }, "NN3gMWSv34ggrAvsV");
      setForm({ name: "", email: "", role: "STUDENT", year: "" });
      addToast("User created and credentials sent!", "success");
      fetchData();
    } catch (e) { 
      console.error(e); 
      addToast("Failed to create user", "error");
    }
  };

  const handleUpdate = async () => {
    try { await api.put(`${API_USERS}/${editUser.id}`, editUser); setEditUser(null); fetchData(); } catch (e) { console.error(e); }
  };

  const handleApprove = async (id) => {
    try { await api.put(`${API_USERS}/${id}/approve`); fetchData(); } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete user?")) {
      try { await api.delete(`${API_USERS}/${id}`); fetchData(); } catch (e) { console.error(e); }
    }
  };

  const handleAssignFee = async () => {
    try {
      await api.post(API_FEES, { totalFees: Number(feeForm.totalFees), paidFees: Number(feeForm.paidFees)||0, user: {id: selectedStudent.id} });
      setIsAssignModalOpen(false);
      setFeeForm({ totalFees: "", paidFees: "" });
      fetchData();
    } catch (e) { addToast("Operation failed", "error"); }
  };

  const handleLogPayment = async () => {
    try {
      const rec = fees.find(f => f.user?.id === selectedStudent.id);
      const paid = Number(rec.paidFees) + Number(feeForm.paidFees);
      await api.put(`${API_FEES}/${rec.id}`, { ...rec, paidFees: paid, remainingFees: rec.totalFees - paid, status: (rec.totalFees-paid)<=0?'Paid':'Pending' });
      setIsPayModalOpen(false);
      setFeeForm({ totalFees: "", paidFees: "" });
      fetchData();
    } catch (e) { addToast("Operation failed", "error"); }
  };

  const getFee = (id) => fees.find(f => f.user?.id === id);

  const tabs = ["Students", "Teachers", "Pending", "Fees"];
  const filteredData = [
    users.filter(u => u.role === "STUDENT" && u.approved),
    users.filter(u => u.role === "TEACHER" && u.approved),
    users.filter(u => !u.approved),
    users.filter(u => u.role === "STUDENT" && u.approved)
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">
           HOD <span className="text-indigo-600">Control Center</span>
        </h1>
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">{user?.department} Administration</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Stats/Add Form */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            {tabIndex === 3 ? (
              <motion.div key="stats" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sticky top-28">
                 {[
                   { label: "Total Expected Collection", val: fees.filter(f=>f.user?.department===user.department).reduce((a,b)=>a+b.totalFees,0), color: "from-indigo-600 to-indigo-700" },
                   { label: "Total Amount Collected", val: fees.filter(f=>f.user?.department===user.department).reduce((a,b)=>a+b.paidFees,0), color: "from-emerald-500 to-emerald-600" }
                 ].map(stat => (
                   <div key={stat.label} className={`bg-gradient-to-br ${stat.color} p-8 rounded-[2.5rem] shadow-xl text-white`}>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">{stat.label}</p>
                      <p className="text-3xl font-black italic">₹{stat.val.toLocaleString()}</p>
                   </div>
                 ))}
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-28">
                 <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Add New <span className="text-indigo-600">User</span></h2>
                 <div className="space-y-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Full Name</label>
                       <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm font-medium" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Email Address</label>
                       <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm font-medium" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Role</label>
                       <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none">
                          <option value="STUDENT">Student</option>
                          <option value="TEACHER">Teacher</option>
                       </select>
                    </div>
                    {form.role === "STUDENT" && (
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Year</label>
                          <select value={form.year} onChange={e=>setForm({...form,year:e.target.value})} className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none">
                             <option value="">Select Year</option>
                             <option value="1">1st Year</option>
                             <option value="2">2nd Year</option>
                             <option value="3">3rd Year</option>
                             <option value="4">4th Year</option>
                          </select>
                       </div>
                    )}
                    <button onClick={handleAddUser} className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95">Add User</button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel: Content Grid */}
        <div className="lg:col-span-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto w-full md:w-auto">
                   {tabs.map((t, i) => (
                      <button key={i} onClick={() => setTabIndex(i)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tabIndex === i ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                         {t}
                      </button>
                   ))}
                </div>
                <input 
                  type="text" placeholder="Filter names..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full md:w-64 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all text-sm font-medium"
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredData[tabIndex]
                    .filter(u => u.name?.toLowerCase().includes(search.toLowerCase()))
                    .map((u, idx) => {
                      const fr = getFee(u.id);
                      return (
                        <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: idx * 0.05 }} key={u.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="font-black text-slate-800 tracking-tight">{highlight(u.name, search)}</h3>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${u.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                 {u.approved ? "Approved" : "Pending"}
                              </span>
                           </div>
                           <p className="text-slate-500 text-[10px] font-bold mb-4 break-all uppercase tracking-widest">{u.email}</p>
                           
                           {tabIndex === 3 && (
                             <div className="mb-4 p-3 bg-white rounded-xl border border-slate-100">
                                {fr ? (
                                   <div className="flex justify-between items-center">
                                      <div>
                                         <p className="text-[10px] font-black text-slate-400 uppercase">Due</p>
                                         <p className="text-sm font-black text-slate-900">₹{fr.remainingFees}</p>
                                      </div>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${fr.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{fr.status}</span>
                                   </div>
                                ) : <p className="text-[10px] font-black text-slate-400 uppercase italic">Unassigned Fee Profile</p>}
                             </div>
                           )}

                           <div className="flex gap-2">
                              {tabIndex === 3 ? (
                                 !fr ? <button onClick={()=>{setSelectedStudent(u);setIsAssignModalOpen(true);}} className="flex-1 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-indigo-700">Assign Fee</button>
                                     : fr.status !== 'Paid' ? <button onClick={()=>{setSelectedStudent(u);setIsPayModalOpen(true);}} className="flex-1 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-emerald-600">Log Payment</button>
                                     : <span className="flex-1 py-2 bg-emerald-50 text-emerald-600 text-center text-[10px] font-black uppercase rounded-lg border border-emerald-100">Fully Paid ✓</span>
                              ) : (
                                 <>
                                    {!u.approved && <button onClick={()=>handleApprove(u.id)} className="flex-1 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-emerald-600">Approve</button>}
                                    <button onClick={()=>setEditUser(u)} className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg hover:bg-slate-50">Edit</button>
                                    <button onClick={()=>handleDelete(u.id)} className="flex-1 py-2 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-lg hover:bg-rose-100">Delete</button>
                                 </>
                              )}
                           </div>
                        </motion.div>
                      );
                    })}
                </AnimatePresence>
             </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal open={!!editUser} onClose={()=>setEditUser(null)} title="Modify User Data">
         {editUser && (
           <div className="space-y-4">
              {["name","email"].map(f => (
                <div key={f}>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">{f}</label>
                   <input value={editUser[f]||""} onChange={e=>setEditUser({...editUser,[f]:e.target.value})} className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm font-medium" />
                </div>
              ))}
              <div className="flex gap-3 pt-6">
                 <button onClick={()=>setEditUser(null)} className="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl transition-colors">Cancel</button>
                 <button onClick={handleUpdate} className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all active:scale-95">Save</button>
              </div>
           </div>
         )}
      </Modal>

      <Modal open={isAssignModalOpen} onClose={()=>setIsAssignModalOpen(false)} title="Assign Annual Fees">
         <div className="space-y-4">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-tight">Assigning for: <span className="text-slate-900">{selectedStudent?.name}</span></p>
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Total Fee Amount (₹)</label>
               <input type="number" value={feeForm.totalFees} onChange={e=>setFeeForm({...feeForm,totalFees:e.target.value})} className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm font-medium" />
            </div>
            <div className="flex gap-3 pt-6">
               <button onClick={()=>setIsAssignModalOpen(false)} className="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl transition-colors">Cancel</button>
               <button onClick={handleAssignFee} className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all active:scale-95">Confirm Assignment</button>
            </div>
         </div>
      </Modal>

      <Modal open={isPayModalOpen} onClose={()=>setIsPayModalOpen(false)} title="Log Installment">
         <div className="space-y-4">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-tight">Logging for: <span className="text-slate-900">{selectedStudent?.name}</span></p>
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Installment Amount (₹)</label>
               <input type="number" value={feeForm.paidFees} onChange={e=>setFeeForm({...feeForm,paidFees:e.target.value})} className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm font-medium" />
            </div>
            <div className="flex gap-3 pt-6">
               <button onClick={()=>setIsPayModalOpen(false)} className="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl transition-colors">Cancel</button>
               <button onClick={handleLogPayment} className="flex-1 py-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all active:scale-95">Process Payment</button>
            </div>
         </div>
      </Modal>
    </div>
  );
}