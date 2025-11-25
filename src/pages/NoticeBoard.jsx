import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import {
  Card,
  CardContent,
  Typography,
  Container,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import NoticeForm from "../components/NoticeForm";
import "../styles/NoticeBoard.css";

export default function NoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "notices"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);

      let data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      data = data.map((n) => ({
        title: n.title || "Untitled Notice",
        description: n.description || "No description provided.",
        category: n.category || "General",
        department: n.department || "All",
        year: n.year || "All",
        postedBy: n.postedBy || "Unknown",
        role: n.role || "User",
        imageUrl: n.imageUrl || "",
        timestamp: n.timestamp,
        id: n.id,
      }));

      setNotices(data);
      setFilteredNotices(data); // initial load
    } catch (err) {
      console.error("❌ Error fetching notices:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // 🔍 Filter Logic
  useEffect(() => {
    let filtered = [...notices];

    if (selectedDept !== "All") {
      filtered = filtered.filter((n) => n.department === selectedDept);
    }

    if (selectedYear !== "All") {
      filtered = filtered.filter((n) => n.year === selectedYear.toString());
    }

    setFilteredNotices(filtered);
  }, [selectedDept, selectedYear, notices]);

  if (loading)
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading notices...</Typography>
      </Container>
    );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}
      >
        📢 Notice Board
      </Typography>

      {/* 🧑‍🏫 Teachers/HOD/Admin can post */}
      {["admin", "hod", "teacher"].includes(user?.role) && (
        <Box className="notice-form">
          <NoticeForm onAdded={fetchNotices} />
        </Box>
      )}

      {/* 🔽 Filters Section */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        {/* Department Filter */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={selectedDept}
            label="Department"
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <MenuItem value="All">All Departments</MenuItem>
            <MenuItem value="Computer Engineering">Computer Engineering</MenuItem>
            <MenuItem value="Electrical Engineering">Electrical  Engineering</MenuItem>
            <MenuItem value="Mechanical Engineering">Mechanical  Engineering</MenuItem>
            <MenuItem value="Civil Engineering">Civil  Engineering</MenuItem>
          </Select>
        </FormControl>

        {/* Year Filter */}
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            label="Year"
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <MenuItem value="All">All Years</MenuItem>
            <MenuItem value="1">1st Year</MenuItem>
            <MenuItem value="2">2nd Year</MenuItem>
            <MenuItem value="3">3rd Year</MenuItem>
            <MenuItem value="4">4th Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 📌 Notices */}
      <Box className="notices-section">
        {filteredNotices.length === 0 ? (
          <Alert severity="info">No notices found for selected filters.</Alert>
        ) : (
          <Box
            className="notices-grid"
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 2,
            }}
          >
            {filteredNotices.map((n) => (
              <Card key={n.id} sx={{ borderRadius: 2 }}>
                {n.imageUrl && (
                  <Box
                    sx={{
                      width: "100%",
                      maxHeight: 200,
                      overflow: "hidden",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <img
                      src={n.imageUrl}
                      alt="Notice"
                      style={{
                        width: "100%",
                        objectFit: "contain",
                      }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </Box>
                )}

                <CardContent>
                  <Typography variant="h6">{n.title}</Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {n.description}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    🏛 {n.department} | 🎓 {n.year} | 🗂 {n.category}
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    👤 Posted by: <b>{n.postedBy}</b> ({n.role})
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {n.timestamp?.toDate
                      ? n.timestamp.toDate().toLocaleString()
                      : ""}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}
