import React, { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { uploadImageToImgBB } from "../utils/imageUpload";
import api from "../utils/api";
import { motion } from "framer-motion";

export default function ProfilePanel() {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      return addToast("Please select a valid image file", "error");
    }
    if (file.size > 5 * 1024 * 1024) {
      return addToast("Image size must be under 5MB", "warning");
    }

    setUploading(true);
    try {
      addToast("Uploading profile picture...", "info");
      const imageURL = await uploadImageToImgBB(file);
      
      // Update in backend
      const updatedUser = { ...user, profileURL: imageURL };
      await api.put(`/api/users/${user.id}`, updatedUser);
      
      // Update in local state
      setUser(updatedUser);
      addToast("Profile picture updated successfully!", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to upload image. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />
      
      <div className="relative z-10">
        <div 
          className="relative w-32 h-32 mx-auto mb-6 group cursor-pointer"
          onClick={handleImageClick}
        >
          {user?.profileURL ? (
            <img 
              src={user.profileURL} 
              alt={user.name} 
              className="w-full h-full object-cover rounded-3xl shadow-xl shadow-indigo-100 border-4 border-white group-hover:opacity-75 transition-opacity" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-sky-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 group-hover:opacity-75 transition-opacity">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
               </svg>
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/20 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl flex items-center justify-center">
               <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />

        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{user?.name || "User Name"}</h2>
        <p className="text-slate-400 font-medium mb-8 lowercase text-sm">{user?.email}</p>
        
        <div className="space-y-4 text-left p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Role</span>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-black uppercase tracking-tight">
              {user?.role || "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Department</span>
            <span className="text-slate-800 font-bold">{user?.department || "N/A"}</span>
          </div>
          {user?.role === "STUDENT" && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Year</span>
              <span className="text-slate-800 font-bold">{user?.year || "N/A"}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">User ID</span>
            <span className="text-slate-800 font-bold truncate max-w-[100px]">{user?.id}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
