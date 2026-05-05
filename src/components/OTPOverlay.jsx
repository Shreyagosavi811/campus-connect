import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";

export default function OTPOverlay({ onVerify, onCancel, email }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const { addToast } = useToast();
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code === "123456") {
      addToast("Verification successful!", "success");
      onVerify();
    } else {
      addToast("Invalid OTP. Try '123456'", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-white/20"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Security Check</h2>
          <p className="text-slate-500 text-sm font-medium">We've sent a 6-digit verification code to <span className="text-slate-900 font-bold">{email}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-black text-slate-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all"
              />
            ))}
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
          >
            Verify Identity
          </button>
        </form>

        <div className="mt-8 text-center">
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">
             {timer > 0 ? `Resend in ${timer}s` : <button className="text-indigo-600 hover:underline">Resend Code</button>}
           </p>
           <button onClick={onCancel} className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors">
             Cancel and back to login
           </button>
        </div>
      </motion.div>
    </div>
  );
}
