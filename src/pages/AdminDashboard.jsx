import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import { motion, AnimatePresence } from "framer-motion";
import ProfilePanel from "../components/ProfilePanel";
import { FeeChart, DemographicPie } from "../components/StatsCharts";
import api from "../utils/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const [fees, setFees] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, fRes] = await Promise.all([
          api.get("/api/users"),
          api.get("/api/fees")
        ]);
        setUsers(uRes.data);
        setFees(fRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const normalizedUsers = users.map((u) => ({
    ...u,
    role: u.role ? u.role.toString().trim().toLowerCase() : "",
    department: u.department ? u.department.toString().trim().toLowerCase() : "not assigned",
  }));

  const filteredUsers = normalizedUsers.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    const matchesDept = deptFilter ? u.department === deptFilter : true;
    return matchesSearch && matchesRole && matchesDept;
  });

  const stats = {
    totalUsers: normalizedUsers.length,
    totalHOD: normalizedUsers.filter((u) => u.role === "hod").length,
    totalTeachers: normalizedUsers.filter((u) => u.role === "teacher").length,
    totalStudents: normalizedUsers.filter((u) => u.role === "student").length,
    totalPending: normalizedUsers.filter((u) => !u.approved).length,
  };

  const financialStats = [
    { name: 'Paid', value: fees.reduce((acc, f) => acc + (Number(f.paidFees) || 0), 0) },
    { name: 'Pending', value: fees.reduce((acc, f) => acc + (Number(f.remainingFees) || 0), 0) }
  ];

  const statCards = [
    { label: "Total Users", count: stats.totalUsers, color: "border-indigo-600", textColor: "text-indigo-600" },
    { label: "Total HODs", count: stats.totalHOD, color: "border-emerald-600", textColor: "text-emerald-600" },
    { label: "Total Teachers", count: stats.totalTeachers, color: "border-amber-600", textColor: "text-amber-600" },
    { label: "Total Students", count: stats.totalStudents, color: "border-rose-600", textColor: "text-rose-600" },
    { label: "Pending", count: stats.totalPending, color: "border-sky-600", textColor: "text-sky-600" },
    { label: "Fees", count: stats.totalStudents, color: "border-violet-600", textColor: "text-violet-600", path: "/fees" },
  ];

  const departments = [...new Set(users.map((u) => u.department).filter((dept) => dept && dept !== ""))];

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setDeptFilter("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Admin <span className="text-indigo-600">Overview</span></h1>
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">Control Center & Statistics</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Profile Card */}
        <div className="lg:col-span-4">
           <ProfilePanel />
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full">
            {statCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
                onClick={() => card.path && navigate(card.path)}
                className={`bg-white p-6 rounded-3xl border-t-8 ${card.color} shadow-sm hover:shadow-xl transition-all cursor-${card.path ? 'pointer' : 'default'} flex flex-col justify-center text-center`}
              >
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{card.label}</p>
                <h2 className={`text-3xl font-black ${card.textColor}`}>
                  <CountUp end={card.count} duration={1.5} />
                </h2>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[450px]">
           <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
             <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
             Financial Health (Global)
           </h3>
           <div className="h-[300px]">
              <DemographicPie data={financialStats} />
           </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[450px]">
           <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
             <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
             System Demographics
           </h3>
           <div className="h-[300px]">
              <DemographicPie data={[
                { name: 'Students', value: stats.totalStudents },
                { name: 'Teachers', value: stats.totalTeachers },
                { name: 'HODs', value: stats.totalHOD }
              ]} />
           </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-1">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Search Users</label>
             <input 
               type="text" 
               placeholder="Name or email..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-medium"
             />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Role Filter</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-medium"
            >
              <option value="">All Roles</option>
              <option value="hod">HOD</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-medium"
            >
              <option value="">All Departments</option>
              {departments.map((dept, i) => <option key={i} value={dept}>{dept}</option>)}
            </select>
          </div>
        </div>

        {(search || roleFilter || deptFilter) && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
             <span className="text-xs font-bold text-slate-400 mr-2 uppercase">Active Filters:</span>
             {search && <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">Search: {search}</span>}
             {roleFilter && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase">{roleFilter}</span>}
             {deptFilter && <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold">{deptFilter}</span>}
             <button onClick={clearFilters} className="text-rose-600 text-xs font-black uppercase ml-2 hover:underline">Clear All</button>
          </div>
        )}
      </div>

      {/* Results Section */}
      {(search || roleFilter || deptFilter) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">{user.name || "Anonymous"}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${user.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {user.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mb-4 font-medium">{user.email}</p>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase">{user.role}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase">{user.department}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-slate-400 italic">No users matching your criteria.</div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}