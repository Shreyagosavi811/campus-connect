import { motion } from "framer-motion";

export default function FinanceStats({ totalExpected, totalCollected, totalPending }) {
  const stats = [
    { 
      label: "Expected", 
      val: totalExpected, 
      color: "border-indigo-600", 
      bg: "bg-indigo-50",
      icon: "₹",
      textColor: "text-indigo-900",
      progress: "bg-indigo-600"
    },
    { 
      label: "Collected", 
      val: totalCollected, 
      color: "border-emerald-600", 
      bg: "bg-emerald-50",
      icon: "✓",
      textColor: "text-emerald-900",
      progress: "bg-emerald-600"
    },
    { 
      label: "Outstanding", 
      val: totalPending, 
      color: "border-rose-600", 
      bg: "bg-rose-50",
      icon: "!",
      textColor: "text-rose-900",
      progress: "bg-rose-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          whileHover={{ y: -5 }}
          className={`relative overflow-hidden bg-white p-6 rounded-2xl border-l-8 ${stat.color} shadow-sm hover:shadow-xl transition-all duration-300`}
        >
          {/* Subtle background decoration */}
          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bg} opacity-50 blur-2xl`} />
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <h3 className={`text-2xl font-black ${stat.textColor}`}>
                ₹{stat.val.toLocaleString()}
              </h3>
            </div>
            
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
               <span className={`text-xl font-bold ${stat.textColor}`}>{stat.icon}</span>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: stat.label === "Collected" ? `${(totalCollected / totalExpected) * 100}%` : '100%' }}
                 transition={{ duration: 1, delay: 0.5 }}
                 className={`h-full ${stat.progress}`}
               />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
