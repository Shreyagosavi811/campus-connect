import { motion, AnimatePresence } from "framer-motion";

function Modal({ open, onClose, title, children, maxWidth = "max-w-md" }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full ${maxWidth} z-10`}
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-900">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[80vh]">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function AssignFeeDialog({ open, onClose, form, setForm, onAssign }) {
  const total = (Number(form.tuitionFee)||0) + (Number(form.libraryFee)||0) + (Number(form.hostelFee)||0) + (Number(form.examFee)||0);

  return (
    <Modal open={open} onClose={onClose} title="Assign University Fee" maxWidth="max-w-sm">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Semester</label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all text-sm font-medium"
            value={form.semester || "Semester 1"}
            onChange={e => setForm({...form, semester: e.target.value})}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <option key={s} value={`Semester ${s}`}>Semester {s}</option>
            ))}
          </select>
        </div>
        
        {['Tuition', 'Library', 'Hostel', 'Exam'].map(field => {
          const key = `${field.toLowerCase()}Fee`;
          return (
            <div key={key}>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{field} Fee</label>
              <input 
                type="number"
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all text-sm font-medium"
                value={form[key]} 
                onChange={e => setForm({...form, [key]: e.target.value})} 
              />
            </div>
          );
        })}

        <div className="p-4 bg-indigo-50 rounded-2xl text-center">
          <p className="text-xs font-bold text-indigo-500 uppercase mb-1">Total Calculated</p>
          <p className="text-3xl font-black text-indigo-700">₹{total.toLocaleString()}</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
          <button 
            onClick={onAssign} 
            disabled={total === 0}
            className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            Assign
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function LogPaymentDialog({ open, onClose, student, feeRecord, form, setForm, onPay }) {
  return (
    <Modal open={open} onClose={onClose} title={`Log Payment: ${student?.name}`} maxWidth="max-w-sm">
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl border border-rose-100">
           <span className="text-xs font-bold text-rose-600 uppercase">Outstanding Due</span>
           <span className="text-lg font-black text-rose-700">₹{feeRecord?.remainingFees?.toLocaleString()}</span>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Amount Paid</label>
          <input 
            type="number"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all text-sm font-medium"
            value={form.paidFees} 
            onChange={e => setForm({...form, paidFees: e.target.value})} 
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Payment Method</label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all text-sm font-medium"
            value={form.paymentMethod || "Cash"}
            onChange={e => setForm({...form, paymentMethod: e.target.value})}
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Credit/Debit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
        
        {form.paymentMethod !== "Cash" && (
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Reference Number</label>
            <input 
              type="text"
              placeholder="TXN123456789"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all text-sm font-medium"
              value={form.referenceNumber || ""} 
              onChange={e => setForm({...form, referenceNumber: e.target.value})} 
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
          <button 
            onClick={onPay} 
            disabled={!form.paidFees || form.paidFees <= 0}
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
          >
            Save Payment
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function StudentDetailsDialog({ open, onClose, student, feeRecord, transactions }) {
  return (
    <Modal open={open} onClose={onClose} title={`Student Profile: ${student?.name}`} maxWidth="max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Profile & Summary */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Personal Info</h3>
            <div className="space-y-3">
              {[
                { label: 'Email', value: student?.email },
                { label: 'Dept', value: student?.department },
                { label: 'Year', value: student?.year || '-' }
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">{item.label}</span>
                  <span className="text-slate-900 font-bold">{item.value}</span>
                </div>
              ))}
            </div>
            
            <div className="my-6 h-px bg-slate-200" />
            
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Fee Summary</h3>
            {feeRecord ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Total Due</span>
                  <span className="text-lg font-black text-slate-900">₹{feeRecord.totalFees}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-wider">Total Paid</span>
                  <span className="text-lg font-black text-emerald-600">₹{feeRecord.paidFees}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-rose-500 font-bold uppercase text-[10px] tracking-wider">Outstanding</span>
                  <span className="text-xl font-black text-rose-600">₹{feeRecord.remainingFees}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Current Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight ${
                    feeRecord.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {feeRecord.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic text-center py-4">No fees assigned for this record.</p>
            )}
          </div>
        </div>

        {/* Right Side: Transaction History */}
        <div className="flex flex-col h-full">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Transaction History</h3>
          <div className="flex-1 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-inner">
            {transactions.length > 0 ? (
              <div className="overflow-y-auto max-h-[400px]">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="p-3 font-bold text-slate-500 text-[10px] uppercase">Date</th>
                      <th className="p-3 font-bold text-slate-500 text-[10px] uppercase">Amount</th>
                      <th className="p-3 font-bold text-slate-500 text-[10px] uppercase">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-600">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="p-3 font-black text-emerald-600">₹{t.amount}</td>
                        <td className="p-3 text-slate-600 text-xs font-medium">{t.paymentMethod || 'Cash'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full py-12 text-slate-400 italic text-sm">
                No transactions yet.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
        <button 
          onClick={onClose} 
          className="px-8 py-3 bg-slate-900 hover:bg-black text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95"
        >
          Close Profile
        </button>
      </div>
    </Modal>
  );
}
