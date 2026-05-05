import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import ProfilePanel from "../components/ProfilePanel";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!user?.department) return;
    const fetchStudents = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/users");
        const deptStudents = res.data.filter(u => 
          u.department === user.department && u.role?.toUpperCase() === "STUDENT"
        );
        setStudents(deptStudents);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };
    fetchStudents();
  }, [user]);

  const totalStats = {
    totalStudents: students.length,
    approvedStudents: students.filter((s) => s.approved).length,
    pendingStudents: students.filter((s) => !s.approved).length,
  };

  const statCards = [
    { label: "Total Students", count: totalStats.totalStudents, color: "border-indigo-600", textColor: "text-indigo-600" },
    { label: "Approved Students", count: totalStats.approvedStudents, color: "border-emerald-600", textColor: "text-emerald-600" },
    { label: "Pending Approvals", count: totalStats.pendingStudents, color: "border-amber-600", textColor: "text-amber-600" },
    { label: "Fees Management", count: totalStats.totalStudents, color: "border-violet-600", textColor: "text-violet-600", path: "/fees" },
  ];

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const yearWiseCounts = years.map((year, idx) => {
    const filtered = students.filter((s) => s.year === String(idx + 1));
    const approved = filtered.filter((s) => s.approved).length;
    const pending = filtered.length - approved;
    return { year, total: filtered.length, approved, pending };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">
          Teacher <span className="text-indigo-600">Dashboard</span>
        </h1>
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">
          {user?.department} Department Overview
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Profile Section */}
        <div className="lg:col-span-4">
           <ProfilePanel />
        </div>

        {/* Stats Section */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
            {statCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                onClick={() => card.path && navigate(card.path)}
                className={`bg-white p-8 rounded-[2.5rem] border-t-8 ${card.color} shadow-sm hover:shadow-xl transition-all cursor-${card.path ? 'pointer' : 'default'} text-center flex flex-col justify-center`}
              >
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{card.label}</p>
                <h2 className={`text-4xl font-black ${card.textColor}`}>
                  <CountUp end={card.count} duration={1.5} />
                </h2>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Year-wise Stats */}
      <motion.h2 
        initial={{ opacity: 0 }} 
        whileInView={{ opacity: 1 }} 
        className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-8 flex items-center gap-2"
      >
        <span className="w-2 h-8 bg-indigo-600 rounded-full" />
        Year-wise Breakdown
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {yearWiseCounts.map((y, idx) => (
          <motion.div 
            key={y.year}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all"
          >
            <h3 className="text-lg font-black text-slate-800 mb-6 pb-2 border-b border-slate-50">{y.year} Students</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-400 uppercase text-[10px] tracking-widest">Total</span>
                  <span className="text-slate-900">{y.total}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-emerald-500 uppercase text-[10px] tracking-widest">Approved</span>
                  <span className="text-emerald-600">{y.approved}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-amber-500 uppercase text-[10px] tracking-widest">Pending</span>
                  <span className="text-amber-600">{y.pending}</span>
               </div>
            </div>
            {/* Simple progress bar */}
            <div className="mt-6 w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: y.total > 0 ? `${(y.approved / y.total) * 100}%` : '0%' }}
                 transition={{ duration: 1 }}
                 className="h-full bg-emerald-500"
               />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
