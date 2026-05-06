import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FloatingBlobs from "../components/FloatingBlobs";
import { useToast } from "../context/ToastContext";
import Logo from "../components/Logo";
import OTPOverlay from "../components/OTPOverlay";
import api from "../utils/api";

export default function Login() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const completeLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    addToast(`Welcome back, ${userData.name}!`, "success");

    const role = userData.role;
    if (role === "ADMIN") navigate("/admin");
    else if (role === "TEACHER") navigate("/teacher");
    else if (role === "HOD") navigate("/hod");
    else navigate("/student");
  };

  const handleLogin = async () => {
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", { email, password });
      const data = res.data;

      const role = data.role?.trim().toUpperCase();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);

      const userData = {
        id: data.id,
        email: data.email,
        role,
        name: data.name,
        department: data.department,
        year: data.year,
        financeAccess: data.financeAccess,
      };

      if (role === "ADMIN" || role === "HOD") {
        setPendingUser(userData);
        addToast("Security verification required", "info");
      } else {
        completeLogin(userData);
      }

    } catch (err) {
      console.error(err);
      const msg = err.response?.data || "Server connection failed";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      <FloatingBlobs />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/50 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="relative z-10 text-center">
             <div className="flex justify-center mb-8">
                <Logo className="flex-col !gap-4" />
             </div>
             <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase mb-10">Sign in to your account</p>

            <div className="space-y-4">
              <div className="text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Email Address</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-slate-700 placeholder-slate-300 shadow-inner"
                  placeholder="name@university.edu"
                />
              </div>

              <div className="text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-medium text-slate-700 placeholder-slate-300 shadow-inner"
                  placeholder="••••••••"
                />
              </div>

              <button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full mt-8 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Login"}
              </button>
            </div>

            <div className="mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
              Secure Access Only
            </div>
          </div>
        </div>
      </motion.div>
      {pendingUser && (
        <OTPOverlay 
          email={pendingUser.email} 
          onVerify={() => completeLogin(pendingUser)} 
          onCancel={() => setPendingUser(null)} 
        />
      )}
    </div>
  );
}