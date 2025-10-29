import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import NoticeBoard from "./pages/NoticeBoard";
import LostFoundPage from "./pages/LostAndFound";
import AdminDashboard from "./pages/AdminDashboard";
import HodDashboard from "./pages/HodDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";


import AdminUserManagement from "./pages/AdminUserManagement";
import HODUserManagement from "./pages/HODUserManagement";
import TeacherUserManagement from "./pages/TeacherUserManagement";

// Lost & Found pages
import LostItemForm from "./components/LostItemForm";
import LostItemsList from "./components/LostItemsList";
import FoundItemForm from "./components/FoundItemForm";
import FoundItemsList from "./components/FoundItemsList";

//Quries
import QueriesPage from "./pages/QueriesPage";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Global Navbar */}
        <Navbar />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />

          {/* Notices accessible to all logged-in users */}
          <Route
            path="/notices"
            element={
              <PrivateRoute allowedRoles={["admin", "hod", "teacher", "student"]}>
                <NoticeBoard />
              </PrivateRoute>
            }
          />

          {/* Lost & Found accessible to all logged-in users */}
          <Route
  path="/lostfound"
  element={
    <PrivateRoute allowedRoles={["admin","hod","teacher","student"]}>
      <LostFoundPage />
    </PrivateRoute>
            }
          />
          <Route path="/queries" element={<QueriesPage />} />

          {/* Admin Panel */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard />
                <AdminUserManagement />
              </PrivateRoute>
            }
          />

          {/* HOD Panel */}
          <Route
            path="/hod"
            element={
              <PrivateRoute allowedRoles={["hod"]}>
                <HodDashboard />
                <HODUserManagement />
              </PrivateRoute>
            }
          />

          {/* Teacher Panel */}
          <Route
            path="/teacher"
            element={
              <PrivateRoute allowedRoles={["teacher"]}>
                <TeacherDashboard />
                <TeacherUserManagement />
              </PrivateRoute>
            }
          />

          
          
        </Routes>
      </Router>
    </AuthProvider>
  );
  
}
