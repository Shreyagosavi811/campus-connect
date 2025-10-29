// src/pages/Login.jsx
import { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Container, Typography, TextField, Button, Alert, CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/globals.css";
import "../styles/Login.css";

export default function Login() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", "==", email),
        where("password", "==", password)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0].data();

      if (!userDoc.approved) {
        setError("Your account is not approved yet. Contact admin.");
        setLoading(false);
        return;
      }

      // Save user in context
      setUser(userDoc);

      // Optionally save in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(userDoc));

      // Redirect after login
      navigate("/home"); // always redirect to homepage
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      sx={{ mt: 12, textAlign: "center" }}
      className="login-container"
    >
      <Typography variant="h5" sx={{ mb: 3 }}>
        Campus Connect Login
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogin}
        disabled={loading}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : "Login"}
      </Button>
    </Container>
  );
}
