import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Container, Typography, Grid, Paper } from "@mui/material";
import CountUp from "react-countup";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);

  // Real-time fetch from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Normalize roles to lowercase for consistency
  const normalizedUsers = users.map(u => ({
    ...u,
    role: u.role ? u.role.toLowerCase() : "",
  }));

  // Dashboard stats
  const stats = {
    totalUsers: normalizedUsers.length,
    totalHOD: normalizedUsers.filter((u) => u.role === "hod").length,
    totalTeachers: normalizedUsers.filter((u) => u.role === "teacher").length,
    totalStudents: normalizedUsers.filter((u) => u.role === "student").length,
    totalPending: normalizedUsers.filter((u) => !u.approved).length,
  };

  const statCards = [
    { label: "Total Users", count: stats.totalUsers, color: "#4f46e5" },
    { label: "Total HODs", count: stats.totalHOD, color: "#16a34a" },
    { label: "Total Teachers", count: stats.totalTeachers, color: "#f59e0b" },
    { label: "Total Students", count: stats.totalStudents, color: "#e11d48" },
    { label: "Pending Approval", count: stats.totalPending, color: "#0ea5e9" },
  ];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Admin Dashboard
      </Typography>

      {/* Stats Panel */}
      <Grid container spacing={3}>
        {statCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={2.4} key={i}>
            <Paper
              className="stats-card"
              style={{
                borderTop: `5px solid ${card.color}`,
                textAlign: "center",
                padding: "20px",
                borderRadius: "12px",
                transition: "transform 0.2s ease",
              }}
              elevation={6}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
            >
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: 600, textTransform: "uppercase" }}
              >
                {card.label}
              </Typography>
              <Typography
                variant="h4"
                className="stat-count"
                style={{ color: card.color, fontWeight: "bold" }}
              >
                <CountUp end={card.count} duration={1.5} />
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
