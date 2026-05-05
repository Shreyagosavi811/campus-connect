import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { motion } from "framer-motion";

const Icons = {
  Assignment: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  Event: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>,
  Search: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Person: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
};

export default function Home() {
  const [userName, setUserName] = useState("");
  const [notifications, setNotifications] = useState({ notices: false, lostFound: false, mentorship: false });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.name) setUserName(storedUser.name);

    const checkUpdates = (collectionName, key) => {
      const q = query(collection(db, collectionName), orderBy("date_posted", "desc"), limit(1));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const latestDoc = snapshot.docs[0];
          const lastSeen = localStorage.getItem(`lastSeen_${collectionName}`);
          const latestTime = latestDoc.data().date_posted?.seconds || 0;
          if (!lastSeen || latestTime > parseInt(lastSeen)) setNotifications(prev => ({ ...prev, [key]: true }));
        }
      });
    };

    checkUpdates("notices", "notices");
    checkUpdates("lostFoundItems", "lostFound");
    checkUpdates("queries", "mentorship");
  }, []);

  const handleNavigation = (section, path) => {
    localStorage.setItem(`lastSeen_${section}`, (Date.now() / 1000).toString());
    setNotifications(prev => ({ ...prev, [section]: false }));
    navigate(path);
  };

  const sections = [
    { id: "notices", title: "Notice Board", path: "/notices", desc: "Critical updates and campus announcements.", icon: <Icons.Assignment />, hasNotification: notifications.notices, color: "text-indigo-600 bg-indigo-50", grid: "md:col-span-2 md:row-span-2" },
    { id: "events", title: "Events", path: "/events", desc: "Discover workshops and cultural meets.", icon: <Icons.Event />, hasNotification: false, color: "text-sky-500 bg-sky-50", grid: "md:col-span-2 md:row-span-1" },
    { id: "lostFound", title: "Recovery", path: "/lostfound", desc: "Claim lost items or report findings.", icon: <Icons.Search />, hasNotification: notifications.lostFound, color: "text-amber-500 bg-amber-50", grid: "md:col-span-1 md:row-span-1" },
    { id: "mentorship", title: "Mentorship", path: "/queries", desc: "Academic guidance & Q&A.", icon: <Icons.Person />, hasNotification: notifications.mentorship, color: "text-emerald-500 bg-emerald-50", grid: "md:col-span-1 md:row-span-1" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-[3rem] p-12 mb-12 border border-slate-100 shadow-2xl shadow-indigo-100/50 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-50" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-6xl font-black text-slate-900 leading-none tracking-tighter mb-6 uppercase">
            Elevate Your <span className="text-indigo-600 italic">Campus</span> Life
          </h1>
          <p className="text-slate-500 text-lg font-medium mb-10 leading-relaxed">
            Welcome back, <span className="text-slate-900 font-black">{userName || "Student"}</span>. Your central hub for notices, events, and campus guidance is ready.
          </p>
          <div className="flex flex-wrap gap-4">
             <button onClick={() => navigate('/notices')} className="px-8 py-4 bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">Explore Notices</button>
             <button onClick={() => navigate('/events')} className="px-8 py-4 bg-white border border-slate-200 text-slate-600 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95">Upcoming Events</button>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6">
        {sections.map((sec, idx) => (
          <motion.div
            key={sec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => handleNavigation(sec.id, sec.path)}
            className={`${sec.grid} group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between`}
          >
            <div className="relative z-10">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${sec.color} group-hover:scale-110 transition-transform duration-300`}>
                  {sec.icon}
               </div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mb-2">
                  {sec.title}
                  {sec.hasNotification && (
                    <span className="h-3 w-3 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                  )}
               </h2>
               <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[240px]">{sec.desc}</p>
            </div>
            
            <div className="mt-8 flex justify-end relative z-10">
               <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
               </div>
            </div>

            <div className="absolute bottom-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full blur-3xl -mr-16 -mb-16 group-hover:bg-indigo-50 transition-colors" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
