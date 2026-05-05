import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import ProfilePanel from "../components/ProfilePanel";
import { DemographicPie, UserActivityBar } from "../components/StatsCharts";

export default function HodDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/users");
      const deptUsers = res.data.filter(u => 
        u.department === user.department && 
        (u.role?.toUpperCase() === "TEACHER" || u.role?.toUpperCase() === "STUDENT")
      );
      setUsers(deptUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => { if(user) fetchUsers(); }, [user]);

  const stats = {
    totalUsers: users.length,
    totalTeachers: users.filter(u => u.role?.toUpperCase() === "TEACHER").length,
    totalStudents: users.filter(u => u.role?.toUpperCase() === "STUDENT").length,
    pending: users.filter(u => !u.approved).length,
    year1: users.filter(u => u.role?.toUpperCase() === "STUDENT" && u.year === "1").length,
    year2: users.filter(u => u.role?.toUpperCase() === "STUDENT" && u.year === "2").length,
    year3: users.filter(u => u.role?.toUpperCase() === "STUDENT" && u.year === "3").length,
    year4: users.filter(u => u.role?.toUpperCase() === "STUDENT" && u.year === "4").length,
  };

  const statCards = [
    { label: "Total Staff & Students", count: stats.totalUsers, color: "border-indigo-600", textColor: "text-indigo-600" },
    { label: "Faculty Members", count: stats.totalTeachers, color: "border-emerald-600", textColor: "text-emerald-600" },
    { label: "Students", count: stats.totalStudents, color: "border-amber-600", textColor: "text-amber-600" },
    { label: "Pending Approval", count: stats.pending, color: "border-rose-600", textColor: "text-rose-600", path: "/hod" },
    { label: "Fees Management", count: stats.totalStudents, color: "border-violet-600", textColor: "text-violet-600", path: "/fees" },
  ];

  const yearCards = [
    { label: "1st Year", count: stats.year1, color: "bg-slate-50 border-slate-100" },
    { label: "2nd Year", count: stats.year2, color: "bg-slate-50 border-slate-100" },
    { label: "3rd Year", count: stats.year3, color: "bg-slate-50 border-slate-100" },
    { label: "4th Year", count: stats.year4, color: "bg-slate-50 border-slate-100" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">
          HOD <span className="text-indigo-600">Dashboard</span>
        </h1>
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">
          {user?.department} Department Administration
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Profile Section */}
        <div className="lg:col-span-4">
           <ProfilePanel />
        </div>

        {/* Main Stats Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full">
            {statCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
                onClick={() => card.path && navigate(card.path)}
                className={`bg-white p-6 rounded-[2rem] border-t-8 ${card.color} shadow-sm hover:shadow-xl transition-all cursor-${card.path ? 'pointer' : 'default'} text-center flex flex-col justify-center`}
              >
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{card.label}</p>
                <h2 className={`text-3xl font-black ${card.textColor}`}>
                  <CountUp end={card.count} duration={1.5} />
                </h2>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
             <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
             Role Distribution
           </h3>
           <DemographicPie data={[
             { name: 'Teachers', value: stats.totalTeachers },
             { name: 'Students', value: stats.totalStudents }
           ]} />
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
             <span className="w-1.5 h-6 bg-sky-500 rounded-full" />
             Year-wise Students
           </h3>
           <UserActivityBar data={[
             { name: '1st Yr', count: stats.year1 },
             { name: '2nd Yr', count: stats.year2 },
             { name: '3rd Yr', count: stats.year3 },
             { name: '4th Yr', count: stats.year4 }
           ]} />
        </div>
      </div>

      {/* Student Demographics Section */}
      <motion.h2 
        initial={{ opacity: 0 }} 
        whileInView={{ opacity: 1 }} 
        className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-8 flex items-center gap-2"
      >
        <span className="w-2 h-8 bg-indigo-600 rounded-full" />
        Student Demographics
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {yearCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-8 rounded-[2.5rem] border ${card.color} shadow-sm hover:bg-white hover:shadow-xl transition-all group`}
          >
             <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</span>
                <div className="w-2 h-2 rounded-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             <h3 className="text-3xl font-black text-slate-900">{card.count}</h3>
             <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-tight">Active Students</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-indigo-600 rounded-[3rem] shadow-2xl shadow-indigo-100 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
               <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Management Tools</h3>
               <p className="text-indigo-100 font-medium max-w-md">Access department-specific controls for faculty approvals, student year updates, and financial oversight.</p>
            </div>
            <div className="flex gap-4">
               <button onClick={() => navigate("/hod")} className="px-8 py-3 bg-white text-indigo-600 font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl transition-all active:scale-95">Manage Staff</button>
               <button onClick={() => navigate("/fees")} className="px-8 py-3 bg-indigo-500 text-white border border-indigo-400 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-indigo-400 transition-all active:scale-95">Financials</button>
            </div>
         </div>
      </div>
    </div>
  );
}
