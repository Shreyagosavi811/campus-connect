import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { generateReceiptPDF } from "../utils/pdfGenerator";
import ProfilePanel from "../components/ProfilePanel";
import api from "../utils/api";

const Icons = {
  Person: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Wallet: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Download: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Assignment: () => <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  Event: () => <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Search: () => <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  User: () => <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feeRecord, setFeeRecord] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const userId = user?.id || JSON.parse(localStorage.getItem("user") || "{}")?.id;
    if (userId && userId !== "undefined") {
      api.get(`/api/fees/user/${userId}`)
        .then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) setFeeRecord(res.data[0]);
          else if (res.data && !Array.isArray(res.data)) setFeeRecord(res.data);
        })
        .catch(err => console.error("Failed to fetch fees:", err));

      api.get(`/api/transactions/user/${userId}`)
        .then(res => setTransactions(res.data))
        .catch(err => console.error("Failed to fetch transactions:", err));
    }
  }, [user]);

  const quickLinks = [
    { title: "Campus Notices", desc: "View latest announcements", path: "/notices", icon: <Icons.Assignment />, color: "text-indigo-600 bg-indigo-50" },
    { title: "Upcoming Events", desc: "Register and RSVP", path: "/events", icon: <Icons.Event />, color: "text-sky-500 bg-sky-50" },
    { title: "Lost & Found", desc: "Report or claim items", path: "/lostfound", icon: <Icons.Search />, color: "text-amber-500 bg-amber-50" },
    { title: "Mentorship", desc: "Ask academic questions", path: "/queries", icon: <Icons.User />, color: "text-emerald-500 bg-emerald-50" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black text-center mb-12 bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent uppercase tracking-tighter"
      >
        Student Portal
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-4">
          <ProfilePanel />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Financial Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Icons.Wallet />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Financial Overview</h3>
            </div>

            {feeRecord ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Total Fees", val: feeRecord.totalFees, color: "text-slate-900 bg-slate-50 border-slate-100" },
                  { label: "Amount Paid", val: feeRecord.paidFees, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                  { label: "Outstanding", val: feeRecord.remainingFees, color: "text-rose-600 bg-rose-50 border-rose-100" }
                ].map(stat => (
                  <div key={stat.label} className={`p-4 rounded-2xl border ${stat.color}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{stat.label}</p>
                    <p className="text-2xl font-black">₹{stat.val.toLocaleString()}</p>
                  </div>
                ))}
                <div className="col-span-full mt-4 flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                   <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Status:</span>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${feeRecord.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {feeRecord.status}
                      </span>
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase italic">Contact HOD for payment logs</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-6">No fee records found for your account.</p>
            )}
          </motion.div>

          {/* Payment History */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
          >
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-6">Payment History</h3>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref No</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-xs font-bold text-slate-600">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-lg text-xs font-black ${t.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400'}`}>
                            {t.amount > 0 ? `+ ₹${t.amount}` : '-'}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-600">{t.paymentMethod || 'Cash'}</td>
                        <td className="p-4 text-[10px] font-mono text-slate-400 uppercase">{t.referenceNumber ? t.referenceNumber : `TXN-${String(t.id || "").slice(-6)}`}</td>
                        <td className="p-4 text-center">
                          {t.amount > 0 && (
                            <button 
                              onClick={() => generateReceiptPDF(t, user, feeRecord)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                              title="Download Receipt"
                            >
                              <Icons.Download />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-6">No transactions recorded yet.</p>
            )}
          </motion.div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link, idx) => (
              <motion.div 
                key={link.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                onClick={() => navigate(link.path)}
                className="group p-6 bg-white rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-inner ${link.color} group-hover:scale-110 transition-transform duration-300`}>
                   {link.icon}
                </div>
                <h4 className="text-lg font-black text-slate-800 tracking-tight">{link.title}</h4>
                <p className="text-slate-400 text-xs font-medium">{link.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
