import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Container, Typography, Grid, Paper } from "@mui/material";
import CountUp from "react-countup";
import "../styles/TeacherDashboard.css";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);

  // Fetch students in real-time
  useEffect(() => {
    if (!user?.department) return;
    const q = query(
      collection(db, "users"),
      where("department", "==", user.department),
      where("role", "==", "student")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  // Compute total stats
  const totalStats = {
    totalStudents: students.length,
    approvedStudents: students.filter((s) => s.approved).length,
    pendingStudents: students.filter((s) => !s.approved).length,
  };

  const statCards = [
    { label: "Total Students", count: totalStats.totalStudents, color: "#2563eb" },
    { label: "Approved Students", count: totalStats.approvedStudents, color: "#16a34a" },
    { label: "Pending Approvals", count: totalStats.pendingStudents, color: "#f59e0b" },
  ];

  // Compute year-wise counts
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const yearWiseCounts = years.map((year, idx) => {
    const filtered = students.filter((s) => s.year === String(idx + 1));
    const approved = filtered.filter((s) => s.approved).length;
    const pending = filtered.length - approved;
    return { year, total: filtered.length, approved, pending };
  });

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Teacher Dashboard - {user?.department} Department
      </Typography>

      {/* Overall Stats */}
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              className="stats-card"
              style={{ borderTop: `5px solid ${card.color}` }}
              elevation={6}
            >
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                {card.label}
              </Typography>
              <Typography variant="h4" className="stat-count" style={{ color: card.color }}>
                <CountUp end={card.count} duration={1.5} />
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Year-wise Stats */}
      <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
        Year-wise Student Count
      </Typography>
      <Grid container spacing={3}>
        {yearWiseCounts.map((y) => (
          <Grid item xs={12} sm={6} md={3} key={y.year}>
            <Paper className="stats-card year-card" elevation={4}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                {y.year} Students
              </Typography>
              <Typography variant="body2">Total: {y.total}</Typography>
              <Typography variant="body2" className="approved">Approved: {y.approved}</Typography>
              <Typography variant="body2" className="pending">Pending: {y.pending}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
