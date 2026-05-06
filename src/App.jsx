import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

import PrivateRoute from "./routes/PrivateRoute";
import Navbar from "./components/Navbar";
import LoadingScreen from "./components/LoadingScreen";
import Login from "./pages/Login";
import Home from "./pages/Home";

// Pages
import NoticeBoard from "./pages/NoticeBoard";
import LostFoundPage from "./pages/LostAndFound";
import QueriesPage from "./pages/QueriesPage";
import Events from "./pages/Events";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserManagement from "./pages/AdminUserManagement";

// HOD
import HodDashboard from "./pages/HodDashboard";
import HODUserManagement from "./pages/HODUserManagement";

// Teacher
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherUserManagement from "./pages/TeacherUserManagement";
import FinancePanel from "./FinancePanel";

// Student
import StudentDashboard from "./pages/StudentDashboard";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
            <AppContent />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  useEffect(() => {
    // Initial loading delay for brand visibility
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      {!isLoginPage && <Navbar />}
      <AnimatedRoutes />
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location} key={location.pathname}>

          {/* ================= PUBLIC ================= */}
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />

          {/* ================= COMMON (ALL LOGGED USERS) ================= */}
          <Route
            path="/events"
            element={
              <PrivateRoute allowedRoles={["admin", "hod", "teacher", "student"]}>
                <Events />
              </PrivateRoute>
            }
          />

          <Route
            path="/notices"
            element={
              <PrivateRoute allowedRoles={["admin", "hod", "teacher", "student"]}>
                <NoticeBoard />
              </PrivateRoute>
            }
          />

          <Route
            path="/lostfound"
            element={
              <PrivateRoute allowedRoles={["admin", "hod", "teacher", "student"]}>
                <LostFoundPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/queries"
            element={
              <PrivateRoute allowedRoles={["admin", "hod", "teacher", "student"]}>
                <QueriesPage />
              </PrivateRoute>
            }
          />

          {/* ================= ADMIN ================= */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <div>
                  <AdminDashboard />
                  <AdminUserManagement />
                </div>
              </PrivateRoute>
            }
          />

          {/* ================= HOD ================= */}
          <Route
            path="/hod"
            element={
              <PrivateRoute allowedRoles={["hod"]}>
                <div>
                  <HodDashboard />
                  <HODUserManagement />
                </div>
              </PrivateRoute>
            }
          />

          {/* ================= TEACHER ================= */}
          <Route
            path="/teacher"
            element={
              <PrivateRoute allowedRoles={["teacher"]}>
                <div>
                  <TeacherDashboard />
                  <TeacherUserManagement />
                </div>
              </PrivateRoute>
            }
          />

          <Route
            path="/fees"
            element={
              <PrivateRoute allowedRoles={["teacher", "hod", "admin"]}>
                <FinancePanel />
              </PrivateRoute>
            }
          />

          {/* ================= STUDENT ================= */}
          <Route
            path="/student"
            element={
              <PrivateRoute allowedRoles={["student", "admin"]}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />

        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}