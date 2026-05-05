import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, updateDoc, doc, arrayUnion, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import EventForm from "../components/EventForm";
import { motion, AnimatePresence } from "framer-motion";
import CalendarView from "../components/CalendarView";

const Icons = {
  Event: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Location: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Group: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Person: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
};

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-lg z-10 p-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6">{title}</h2>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openRsvp, setOpenRsvp] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [openViewReg, setOpenViewReg] = useState(false);
  const [view, setView] = useState("list"); // "list" or "calendar"
  const [viewEvent, setViewEvent] = useState(null);

  const role = user?.role?.trim().toUpperCase();
  const canEdit = ["ADMIN", "HOD", "TEACHER"].includes(role);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "events"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEvents(data);
      setFilteredEvents(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  useEffect(() => {
    if (selectedCategory === "All") setFilteredEvents(events);
    else setFilteredEvents(events.filter(e => e.category === selectedCategory));
  }, [selectedCategory, events]);

  const handleOpenRsvp = (event) => {
    const isRegistered = event.registrations?.some(reg => reg.id === user?.id) || false;
    if (isRegistered) return;
    setSelectedEvent(event);
    setOpenRsvp(true);
  };

  const handleConfirmRsvp = async () => {
    if (!selectedEvent || !user) return;
    setRsvpLoading(true);
    try {
      const eventRef = doc(db, "events", selectedEvent.id);
      const studentData = {
        id: user.id,
        name: user.name || "Unknown Student",
        email: user.email || "No Email",
        registeredAt: new Date().toISOString()
      };
      await updateDoc(eventRef, { registrations: arrayUnion(studentData) });
      setOpenRsvp(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) { console.error("RSVP Error:", error); }
    setRsvpLoading(false);
  };

  const handleViewRegistrations = (event) => {
    setViewEvent(event);
    setOpenViewReg(true);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, "events", id));
      fetchEvents();
    } catch (error) { console.error("Delete Error:", error); }
  };

  const categories = ["All", "Technical", "Cultural", "Workshop", "Sports", "Other"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2">
          Campus <span className="text-indigo-600">Events</span>
        </h1>
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">Discover. Participate. Lead.</p>
      </motion.div>

      {canEdit && <EventForm onAdded={fetchEvents} />}

      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-10">
         {/* Category Filter */}
         <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-2">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                  selectedCategory === cat ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
         </div>

         {/* View Toggle */}
         <div className="bg-slate-100 p-1 rounded-xl flex">
            <button 
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </button>
            <button 
              onClick={() => setView("calendar")}
              className={`p-2 rounded-lg transition-all ${view === "calendar" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>
         </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
           <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : view === "calendar" ? (
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
         >
           <CalendarView 
             events={filteredEvents} 
             onEventClick={(event) => handleOpenRsvp(event)} 
           />
         </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {filteredEvents.map((event, index) => {
              const isRegistered = event.registrations?.some(reg => reg.id === user?.id);
              const regCount = event.registrations?.length || 0;
              return (
                <motion.div
                  layout
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight max-w-[70%]">{event.title}</h3>
                    <span className="px-3 py-1 bg-slate-50 text-slate-500 border border-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest">{event.category}</span>
                  </div>

                  <div className="space-y-3 mb-8">
                     <div className="flex items-center gap-3 text-slate-500">
                        <Icons.Event />
                        <span className="text-sm font-bold">{event.date}</span>
                     </div>
                     <div className="flex items-center gap-3 text-slate-500">
                        <Icons.Clock />
                        <span className="text-sm font-bold">{event.time}</span>
                     </div>
                     <div className="flex items-center gap-3 text-slate-500">
                        <Icons.Location />
                        <span className="text-sm font-bold italic">{event.location}</span>
                     </div>
                  </div>

                  <p className="text-slate-500 text-sm font-medium mb-8 flex-1 leading-relaxed">{event.description}</p>

                  <div className="flex gap-3 pt-6 border-t border-slate-50">
                    <button 
                      onClick={() => handleOpenRsvp(event)}
                      disabled={isRegistered}
                      className={`flex-1 py-3 font-black uppercase text-xs tracking-widest rounded-2xl transition-all active:scale-95 ${
                        isRegistered ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700"
                      }`}
                    >
                      {isRegistered ? "Registered ✓" : "RSVP Now"}
                    </button>

                    {canEdit && (
                      <div className="flex gap-2">
                        <button onClick={() => handleViewRegistrations(event)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-600 rounded-2xl transition-all flex items-center gap-2">
                           <Icons.Group />
                           <span className="text-xs font-black">{regCount}</span>
                        </button>
                        <button onClick={() => handleDeleteEvent(event.id)} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-colors">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* RSVP Modal */}
      <Modal open={openRsvp} onClose={() => setOpenRsvp(false)} title="Confirm Registration">
        <p className="text-slate-600 font-medium mb-6">Are you sure you want to secure your spot for <span className="font-black text-slate-900 underline decoration-indigo-300">{selectedEvent?.title}</span>?</p>
        <div className="flex gap-3 pt-6">
           <button onClick={() => setOpenRsvp(false)} className="flex-1 py-4 text-slate-500 font-black uppercase text-xs hover:bg-slate-50 rounded-2xl transition-colors">No, Cancel</button>
           <button onClick={handleConfirmRsvp} disabled={rsvpLoading} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs rounded-2xl shadow-xl transition-all active:scale-95">
             {rsvpLoading ? "Processing..." : "Yes, Register"}
           </button>
        </div>
      </Modal>

      {/* Registrations List Modal */}
      <Modal open={openViewReg} onClose={() => setOpenViewReg(false)} title="Registered Participants">
         <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {viewEvent?.registrations?.length > 0 ? (
               viewEvent.registrations.map(student => (
                  <div key={student.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                        <Icons.Person />
                     </div>
                     <div>
                        <p className="font-black text-slate-800 text-sm tracking-tight">{student.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{student.email}</p>
                     </div>
                  </div>
               ))
            ) : (
               <p className="text-slate-400 italic text-center py-8">No registrations found yet.</p>
            )}
         </div>
         <button onClick={() => setOpenViewReg(false)} className="w-full mt-8 py-4 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all active:scale-95">Close Roster</button>
      </Modal>
    </div>
  );
}
