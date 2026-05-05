import { useState, useEffect } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && !user) {
      setUser(JSON.parse(storedUser));
    }
  }, [user, setUser]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

  const role = user?.role?.trim().toUpperCase();

  const links = [
    { label: "Home", path: "/home" },
    { label: "Notices", path: "/notices" },
    { label: "Events", path: "/events" },
    { label: "Lost & Found", path: "/lostfound" },
    { label: "Mentorship & Queries", path: "/queries" },
  ];

  if (role === "ADMIN") {
    links.push({ label: "Admin Panel", path: "/admin" });
    links.push({ label: "Fees", path: "/fees" });
  } else if (role === "HOD") {
    links.push({ label: "HOD Panel", path: "/hod" });
    links.push({ label: "Fees", path: "/fees" });
  } else if (role === "TEACHER") {
    links.push({ label: "Teacher Panel", path: "/teacher" });
    links.push({ label: "Fees", path: "/fees" });
  } else if (role === "STUDENT") {
    links.push({ label: "My Fees", path: "/student" });
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/home" className="flex items-center">
            <Logo />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-2">
            {user && links.map((link) => (
              <NavLink
                key={link.label}
                to={link.path}
                className={({ isActive }) => 
                  `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive 
                      ? "bg-indigo-100 text-indigo-600" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {user && (
              <button 
                onClick={handleLogout}
                className="ml-4 px-6 py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-sm font-black uppercase rounded-xl shadow-lg shadow-rose-200 transition-all active:scale-95"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          {user && (
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white/90 backdrop-blur-2xl shadow-2xl z-50 md:hidden p-6"
            >
              <div className="flex justify-end mb-8">
                <button onClick={toggleMobileMenu} className="p-2 text-slate-400 hover:text-slate-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {links.map((link) => (
                  <NavLink
                    key={link.label}
                    to={link.path}
                    onClick={toggleMobileMenu}
                    className={({ isActive }) => 
                      `px-6 py-4 rounded-2xl text-lg font-black tracking-tight transition-all ${
                        isActive 
                          ? "bg-indigo-100 text-indigo-600 translate-x-2" 
                          : "text-slate-500 hover:bg-slate-50"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}

                <div className="h-px bg-slate-100 my-4" />

                <button 
                  onClick={handleLogout}
                  className="w-full px-6 py-4 bg-rose-50 text-rose-600 text-lg font-black uppercase rounded-2xl text-left hover:bg-rose-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}