import { Container, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import "../styles/Home.css";

export default function Home() {
  const [userName, setUserName] = useState("");
  const [notifications, setNotifications] = useState({
    notices: false,
    lostFound: false,
    mentorship: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.name) setUserName(storedUser.name);

    // Helper: Check for new updates in a Firestore collection
    const checkUpdates = (collectionName, key) => {
      const q = query(
        collection(db, collectionName),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const latestDoc = snapshot.docs[0];
          const lastSeen = localStorage.getItem(`lastSeen_${collectionName}`);
          const latestTime = latestDoc.data().timestamp?.toMillis?.() || 0;
          if (!lastSeen || latestTime > parseInt(lastSeen)) {
            setNotifications((prev) => ({ ...prev, [key]: true }));
          }
        }
      });
    };

    const unsubNotices = checkUpdates("notices", "notices");
    const unsubLostFound = checkUpdates("lostFound", "lostFound");
    const unsubMentorship = checkUpdates("queries", "mentorship");

    return () => {
      unsubNotices();
      unsubLostFound();
      unsubMentorship();
    };
  }, []);

  const handleNavigation = (section, path) => {
    localStorage.setItem(`lastSeen_${section}`, Date.now().toString());
    setNotifications((prev) => ({ ...prev, [section]: false }));
    navigate(path);
  };

  return (
    <>
      <Container className="home-container fade-in">
        <Typography className="welcome" variant="h4">
          {userName ? `Welcome, ${userName}` : "Welcome to Campus Connect"}
        </Typography>
        <Typography className="subtitle">
          Your all-in-one student engagement platform.
        </Typography>

        <div className="home-sections">
          {/* Notices */}
          <div className="home-card" onClick={() => handleNavigation("notices", "/notices")}>
            <h3>
              Notices{" "}
              {notifications.notices && <span className="notification-dot" />}
            </h3>
            <p>Stay updated with the latest announcements and notices.</p>
            <button>View Notices</button>
          </div>

          {/* Events */}
          <div className="home-card" onClick={() => handleNavigation("events", "/notices")}>
            <h3>Events</h3>
            <p>Discover upcoming workshops, seminars, and cultural events.</p>
            <button>View Events</button>
          </div>

          {/* Lost & Found */}
          <div className="home-card" onClick={() => handleNavigation("lostFound", "/lostfound")}>
            <h3>
              Lost & Found{" "}
              {notifications.lostFound && <span className="notification-dot" />}
            </h3>
            <p>Report or claim lost items quickly and efficiently.</p>
            <button>Access Portal</button>
          </div>

          {/* Mentorship */}
          <div className="home-card" onClick={() => handleNavigation("mentorship", "/queries")}>
            <h3>
              Mentorship{" "}
              {notifications.mentorship && <span className="notification-dot" />}
            </h3>
            <p>Connect with mentors for academic and career guidance.</p>
            <button>Find a Mentor</button>
          </div>
        </div>
      </Container>
    </>
  );
}
