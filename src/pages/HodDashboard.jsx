import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Container, Typography, Grid, Paper, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CountUp from "react-countup";
import "../styles/HODDashboard.css";

export default function HodDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [pendingList, setPendingList] = useState([]);

  // Fetch all department users
  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    const deptUsers = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => u.department === user.department && (u.role === "teacher" || u.role === "student"));
    setUsers(deptUsers);
    setPendingList(deptUsers.filter(u => !u.approved));
  };

  useEffect(() => { if(user) fetchUsers(); }, [user]);

  const handleApprove = async (id) => {
    await updateDoc(doc(db, "users", id), { approved: true });
    fetchUsers();
  };

  // Dashboard stats
  const stats = {
    totalUsers: users.length,
    totalTeachers: users.filter(u => u.role === "teacher").length,
    totalStudents: users.filter(u => u.role === "student").length,
    pending: users.filter(u => !u.approved).length,
    year1: users.filter(u => u.role === "student" && u.year === "1").length,
    year2: users.filter(u => u.role === "student" && u.year === "2").length,
    year3: users.filter(u => u.role === "student" && u.year === "3").length,
    year4: users.filter(u => u.role === "student" && u.year === "4").length,
  };

  const statCards = [
    { label: "Total Users", count: stats.totalUsers, color: "#3b82f6" },
    { label: "Teachers", count: stats.totalTeachers, color: "#16a34a" },
    { label: "Students", count: stats.totalStudents, color: "#f59e0b" },
    { label: "Pending Approval", count: stats.pending, color: "#e11d48", clickable: true },
  ];

  const yearCards = [
    { label: "1st Year Students", count: stats.year1, color: "#6366f1" },
    { label: "2nd Year Students", count: stats.year2, color: "#2563eb" },
    { label: "3rd Year Students", count: stats.year3, color: "#0ea5e9" },
    { label: "4th Year Students", count: stats.year4, color: "#14b8a6" },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}>
        HOD Dashboard - {user.department} Department
      </Typography>

      {/* Status Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper
              sx={{
                p: 2,
                textAlign: "center",
                borderTop: `5px solid ${card.color}`,
                transition: "transform 0.2s ease",
                "&:hover": { transform: "scale(1.05)" },
                cursor: card.clickable ? "pointer" : "default"
              }}
              elevation={6}
              onClick={() => card.clickable && setPendingList(users.filter(u => !u.approved))}
            >
              <Typography sx={{ mb: 1, fontWeight: 500 }}>{card.label}</Typography>
              <Typography variant="h4" sx={{ color: card.color }}>{card.count}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Year-wise Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {yearCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper
              sx={{
                p: 2,
                textAlign: "center",
                borderTop: `5px solid ${card.color}`,
                transition: "transform 0.2s ease",
                "&:hover": { transform: "scale(1.05)" }
              }}
              elevation={6}
            >
              <Typography sx={{ mb: 1, fontWeight: 500 }}>{card.label}</Typography>
              <Typography variant="h5" sx={{ color: card.color }}>{card.count}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      
             
      
    </Container>
  );
}
