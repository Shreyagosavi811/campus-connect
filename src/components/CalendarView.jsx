import React, { useState } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, 
  eachDayOfInterval, parseISO 
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function CalendarView({ events, onEventClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
        {format(currentMonth, 'MMMM')} <span className="text-indigo-600 font-normal not-italic">{format(currentMonth, 'yyyy')}</span>
      </h2>
      <div className="flex gap-2">
        <button 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    const rows = [];
    let days = [];
    let day = startDate;

    const interval = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-2">
        {interval.map((d, i) => {
          const formattedDate = format(d, dateFormat);
          const isSelected = isSameDay(d, new Date());
          const isOffMonth = !isSameMonth(d, monthStart);
          
          const dayEvents = events.filter(e => {
             try {
                return isSameDay(parseISO(e.date), d);
             } catch {
                return false;
             }
          });

          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className={`min-h-[100px] p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isOffMonth ? 'bg-slate-50/50 border-transparent opacity-30' : 
                isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'
              }`}
              onClick={() => dayEvents.length > 0 && onEventClick(dayEvents[0])}
            >
              <span className={`text-sm font-black ${isSelected ? 'text-indigo-600' : 'text-slate-900'}`}>
                {formattedDate}
              </span>
              
              <div className="mt-2 space-y-1">
                {dayEvents.map((e, idx) => (
                  <div key={idx} className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-[8px] font-bold uppercase truncate max-w-full">
                    {e.title}
                  </div>
                ))}
              </div>

              {dayEvents.length > 0 && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white/50 backdrop-blur-xl p-8 rounded-[3rem] border border-white/50 shadow-2xl">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
