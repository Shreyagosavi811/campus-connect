import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "./context/AuthContext";
import { useFinanceData } from "./hooks/useFinanceData";

// Components
import FinanceStats from "./components/Finance/FinanceStats";
import StudentFeesTable from "./components/Finance/StudentFeesTable";
import AccessManagement from "./components/Finance/AccessManagement";
import { 
  AssignFeeDialog, LogPaymentDialog, StudentDetailsDialog 
} from "./components/Finance/FinanceModals";

export default function FinancePanel() {
  const { user } = useAuth();
  const { 
    students, fees, allPlatformUsers, loading, error,
    toggleUserAccess, getStudentTransactions, assignFee, logPayment 
  } = useFinanceData(user);

  const [search, setSearch] = useState("");
  const [masterTab, setMasterTab] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  
  // Modal States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [feeForm, setFeeForm] = useState({ 
    totalFees: "", paidFees: "", 
    tuitionFee: "", libraryFee: "", hostelFee: "", examFee: "", semester: "Semester 1",
    paymentMethod: "Cash", referenceNumber: ""
  });

  // Access check
  if (user && user.role?.toUpperCase() !== "ADMIN" && !user.financeAccess) {
    return (
      <div className="container mx-auto max-w-2xl mt-24 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white p-12 text-center rounded-[2.5rem] shadow-2xl border-t-[12px] border-rose-500">
            <h1 className="text-4xl font-black text-rose-600 mb-4 uppercase tracking-tighter">Access Denied</h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              You do not have permission to access the Finance Panel. <br/> 
              <span className="text-slate-400 text-sm mt-4 block italic">Please contact an administrator to request access.</span>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Helpers
  const getStudentFeeRecord = (studentId) => {
    return fees.find(f => (f.user && f.user.id === studentId) || (f.userId === studentId));
  };

  const highlight = (text, query) => {
    if (!query) return text;
    const parts = text?.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <span key={i} className="bg-amber-200 px-1 rounded text-amber-900">{part}</span> 
        : part
    );
  };

  // Calculations
  const stats = useMemo(() => {
    const totalExpected = fees.reduce((acc, f) => acc + (f.totalFees || 0), 0);
    const totalCollected = fees.reduce((acc, f) => acc + (f.paidFees || 0), 0);
    return {
      totalExpected,
      totalCollected,
      totalPending: totalExpected - totalCollected
    };
  }, [fees]);

  const filteredStudents = useMemo(() => {
    const list = [
      students,
      students.filter(s => !getStudentFeeRecord(s.id)),
      students.filter(s => { const r = getStudentFeeRecord(s.id); return r && r.status !== 'Paid'; }),
      students.filter(s => { const r = getStudentFeeRecord(s.id); return r && r.status === 'Paid'; })
    ];
    return (list[tabIndex] || []).filter(s => 
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, fees, tabIndex, search]);

  // Handlers
  const handleOpenDetails = async (student) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);
    const txs = await getStudentTransactions(student.id);
    setTransactions(txs);
  };

  const handleAssignClick = (student) => {
    setSelectedStudent(student);
    setFeeForm({ 
      tuitionFee: "", libraryFee: "", hostelFee: "", examFee: "", 
      semester: "Semester 1", paidFees: 0, paymentMethod: "Cash", referenceNumber: "" 
    });
    setIsAssignOpen(true);
  };

  const handlePayClick = (student) => {
    setSelectedStudent(student);
    setFeeForm({ paidFees: 0, paymentMethod: "Cash", referenceNumber: "" });
    setIsPayOpen(true);
  };

  const submitAssign = async () => {
    const tuition = Number(feeForm.tuitionFee) || 0;
    const library = Number(feeForm.libraryFee) || 0;
    const hostel = Number(feeForm.hostelFee) || 0;
    const exam = Number(feeForm.examFee) || 0;
    const total = tuition + library + hostel + exam;

    const success = await assignFee({
      totalFees: total,
      paidFees: Number(feeForm.paidFees) || 0,
      tuitionFee: tuition,
      libraryFee: library,
      hostelFee: hostel,
      examFee: exam,
      semester: feeForm.semester,
      user: { id: selectedStudent.id }
    });

    if (success) setIsAssignOpen(false);
  };

  const submitPayment = async () => {
    const rec = getStudentFeeRecord(selectedStudent.id);
    const paymentAmount = Number(feeForm.paidFees);
    const totalPaid = Number(rec.paidFees) + paymentAmount;
    
    const success = await logPayment(rec.id, {
      id: rec.id,
      totalFees: rec.totalFees,
      paidFees: totalPaid,
      remainingFees: rec.totalFees - totalPaid,
      status: (rec.totalFees - totalPaid) <= 0 ? "Paid" : "Pending",
      paymentMethod: feeForm.paymentMethod,
      referenceNumber: feeForm.referenceNumber,
      user: { id: selectedStudent.id }
    });

    if (success) setIsPayOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <header className="text-center mb-12">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2">
              Finance <span className="text-indigo-600 italic">Panel</span>
            </h1>
            <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">University Management System</p>
          </header>

          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 mb-8 rounded-xl shadow-sm">
              <p className="text-rose-700 text-sm font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}

          {user?.role?.toUpperCase() === "ADMIN" && (
            <div className="flex justify-center mb-10">
              <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex gap-2">
                {["Fees Dashboard", "Access Control"].map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setMasterTab(i)}
                    className={`px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-tight transition-all ${
                      masterTab === i 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {masterTab === 0 ? (
              <motion.div 
                key="fees" 
                initial={{ x: -20, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                exit={{ x: 20, opacity: 0 }}
                className="space-y-8"
              >
                <FinanceStats {...stats} />

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full blur-3xl -mr-16 -mt-16" />
                  
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 relative z-10">
                    <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100 overflow-x-auto w-full lg:w-auto">
                      {["All", "Unassigned", "Pending", "Paid"].map((t, i) => (
                        <button 
                          key={i} 
                          onClick={() => setTabIndex(i)}
                          className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight whitespace-nowrap transition-all ${
                            tabIndex === i ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    
                    <div className="relative w-full lg:w-96">
                      <input 
                        type="text" 
                        placeholder="Search student profile..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium text-sm"
                      />
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                      <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                      <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Encrypting Data...</p>
                    </div>
                  ) : (
                    <StudentFeesTable 
                      students={filteredStudents}
                      search={search}
                      getStudentFeeRecord={getStudentFeeRecord}
                      onOpenDetails={handleOpenDetails}
                      onAssign={handleAssignClick}
                      onPay={handlePayClick}
                      highlight={highlight}
                    />
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="access" 
                initial={{ x: 20, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                exit={{ x: -20, opacity: 0 }}
              >
                <AccessManagement 
                  users={allPlatformUsers} 
                  currentUser={user} 
                  onToggleAccess={toggleUserAccess} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modals */}
      <AssignFeeDialog 
        open={isAssignOpen} 
        onClose={() => setIsAssignOpen(false)}
        form={feeForm}
        setForm={setFeeForm}
        onAssign={submitAssign}
      />

      <LogPaymentDialog 
        open={isPayOpen} 
        onClose={() => setIsPayOpen(false)}
        student={selectedStudent}
        feeRecord={getStudentFeeRecord(selectedStudent?.id)}
        form={feeForm}
        setForm={setFeeForm}
        onPay={submitPayment}
      />

      <StudentDetailsDialog 
        open={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)}
        student={selectedStudent}
        feeRecord={getStudentFeeRecord(selectedStudent?.id)}
        transactions={transactions}
      />
    </div>
  );
}
