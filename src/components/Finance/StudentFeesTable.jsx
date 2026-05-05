import { motion } from "framer-motion";

export default function StudentFeesTable({ 
  students, search, getStudentFeeRecord, 
  onOpenDetails, onAssign, onPay, highlight 
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse" aria-label="student fees table">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Student</th>
            <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Year</th>
            <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Department</th>
            <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Semester</th>
            <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Total</th>
            <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Paid</th>
            <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Due</th>
            <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Status</th>
            <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((s, idx) => {
            const r = getStudentFeeRecord(s.id);
            return (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                key={s.id} 
                className="group hover:bg-slate-50/80 transition-colors"
              >
                <td className="p-4">
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onOpenDetails(s)}
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {highlight(s.name, search)}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">{s.year || '-'}</td>
                <td className="p-4 text-sm text-slate-600">{s.department}</td>
                <td className="p-4">
                  {r?.semester ? (
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100 text-[10px] font-black uppercase">
                      {r.semester}
                    </span>
                  ) : '-'}
                </td>
                <td className="p-4 text-sm font-bold text-slate-700">{r ? `₹${r.totalFees}` : '-'}</td>
                <td className="p-4 text-sm font-bold text-emerald-600">{r ? `₹${r.paidFees}` : '-'}</td>
                <td className="p-4 text-sm font-bold text-rose-600">{r ? `₹${r.remainingFees}` : '-'}</td>
                <td className="p-4">
                  {r ? (
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                      r.status === 'Paid' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {r.status}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-500">
                      Unassigned
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  {!r ? (
                    <button 
                      onClick={() => onAssign(s)}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-all"
                    >
                      Assign
                    </button>
                  ) : r.status !== 'Paid' ? (
                    <button 
                      onClick={() => onPay(s)}
                      className="px-4 py-1.5 border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-slate-600 text-xs font-bold rounded-lg active:scale-95 transition-all"
                    >
                      Pay
                    </button>
                  ) : (
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Paid</span>
                  )}
                </td>
              </motion.tr>
            );
          })}
          {students.length === 0 && (
            <tr>
              <td colSpan={9} className="p-12 text-center text-slate-400 italic text-sm">
                No students found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
