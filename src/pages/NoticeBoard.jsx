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
} from "@mui/material";
import NoticeForm from "../components/NoticeForm";
import "../styles/NoticeBoard.css";

export default function NoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      // 🔹 Fetch from Firestore
      const q = query(collection(db, "notices"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);

      let data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 🔹 Ensure defaults for missing fields
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
    } catch (err) {
      console.error("❌ Error fetching notices:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

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

      {/* 🔹 Show form only for teachers/admins */}
      {["admin", "hod", "teacher"].includes(user?.role) && (
        <Box className="notice-form">
          <NoticeForm onAdded={fetchNotices} />
        </Box>
      )}

      <Box className="notices-section">
        <Typography component="h5" sx={{ mb: 2 }}>
          Posted Notices
        </Typography>

        {notices.length === 0 ? (
          <Alert severity="info">No notices available.</Alert>
        ) : (
          <Box
            className="notices-grid"
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 2,
            }}
          >
            {notices.map((n) => (
              <Card key={n.id} className="MuiCard-root" sx={{ borderRadius: 2 }}>
                {/* ✅ Optional Image */}
                {n.imageUrl && (
                  <Box
                    className="notice-image"
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
                        height: "auto",
                        objectFit: "contain",
                        display: "block",
                        margin: "0 auto",
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
