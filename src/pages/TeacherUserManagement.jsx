import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, updateDoc, deleteDoc, doc, addDoc, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import emailjs from "emailjs-com";
import {
  Container, Typography, Grid, Paper, Box, TextField,
  Select, MenuItem, Button, Tabs, Tab, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch, Avatar
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import "../styles/TeacherDashboard.css";

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ mt: 2 }}>{children}</Box>}</div>;
}

export default function TeacherUserManagement() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", year: "" });
  const [tabIndex, setTabIndex] = useState(0);
  const [editStudent, setEditStudent] = useState(null);
  const [yearFilter, setYearFilter] = useState(""); // Year filter

  const years = ["1", "2", "3", "4"];

  // Real-time fetch students from Firebase
  useEffect(() => {
    if (!user?.department) return;

    const q = query(
      collection(db, "users"),
      where("department", "==", user.department),
      where("role", "==", "student")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const deptStudents = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data, approved: data.approved === true };
      });
      setStudents(deptStudents);
    });

    return () => unsubscribe();
  }, [user]);

// Add Student
const handleAddStudent = async () => {
  if (!form.name || !form.email || !form.year)
    return alert("All fields required");

  const generatePassword = (length = 10) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!&";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const password = generatePassword();

  await addDoc(collection(db, "users"), {
    ...form,
    role: "student",
    department: user.department,
    approved: false,
    password,
    createdAt: new Date().toISOString(),
  });

  emailjs.send(
    "YOUR_SERVICE_ID",
    "YOUR_TEMPLATE_ID",
    {
      name: form.name,
      email: form.email,
      password,
      department: user.department,
    },
    "YOUR_PUBLIC_KEY"
  );

  alert(`Student added and email sent to ${form.email}`);
  setForm({ name: "", email: "", year: "" });
};


  // Update Student
  const handleUpdate = async () => {
    if (!editStudent) return;
    await updateDoc(doc(db, "users", editStudent.id), editStudent);
    setStudents(prev => prev.map(s => s.id === editStudent.id ? editStudent : s)); // instant update
    setEditStudent(null);
  };

  // Delete Student
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      await deleteDoc(doc(db, "users", id));
      setStudents(prev => prev.filter(s => s.id !== id)); // remove instantly
    }
  };

  // Approve Student
  const handleApprove = async (id) => {
    await updateDoc(doc(db, "users", id), { approved: true });
    setStudents(prev => prev.map(s => s.id === id ? { ...s, approved: true } : s)); // instant update
  };

  const handleTabChange = (e, newValue) => {
    setTabIndex(newValue);
    setYearFilter(""); // Reset filter on tab change
  };

  // Filter students
  const approvedStudents = students.filter(s => s.approved);
  const pendingStudents = students.filter(s => !s.approved);
  const filteredStudents = [approvedStudents, pendingStudents];

  // Apply year filter
  const applyYearFilter = (list) => {
    if (!yearFilter) return list;
    return list.filter(s => s.year === yearFilter);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Teacher Student Management - {user?.department} Department
      </Typography>

      {/* Add Student Form */}
      <Paper className="form-card" elevation={4}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: "center" }}>
          Add New Student
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            fullWidth
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            fullWidth
            sx={{ flex: 1, minWidth: 200 }}
          />
          <Select
            value={form.year || ""}
            onChange={e => setForm({ ...form, year: e.target.value })}
            displayEmpty
            fullWidth
            sx={{ flex: 1, minWidth: 200 }}
          >
            <MenuItem value="" disabled>Select Year</MenuItem>
            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
          <Button variant="contained" onClick={handleAddStudent} sx={{ minWidth: 120 }}>
            Add Student
          </Button>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth">
          <Tab label={`Approved (${approvedStudents.length})`} />
          <Tab label={`Pending (${pendingStudents.length})`} />
        </Tabs>

        {/* Year Filter Dropdown aligned right */}
        <Box sx={{ mt: 2, mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <Select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            displayEmpty
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All Years</MenuItem>
            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </Box>

        {filteredStudents.map((list, idx) => (
          <TabPanel key={idx} value={tabIndex} index={idx}>
            {applyYearFilter(list).length === 0 ? (
              <Typography sx={{ mt: 2 }}>No students found.</Typography>
            ) : (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {applyYearFilter(list).map(s => (
                  <Grid item xs={12} sm={6} md={4} key={s.id}>
                    <Paper className="user-card" elevation={3} sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                        <Avatar sx={{ bgcolor: "#2563EB", width: 56, height: 56 }}>
                          <PersonIcon fontSize="large" />
                        </Avatar>
                      </Box>
                      <Typography sx={{ fontWeight: "bold", textAlign: "center" }}>{s.name}</Typography>
                      <Typography sx={{ textAlign: "center", fontSize: "0.8rem" }}>Email: {s.email}</Typography>
                      <Typography sx={{ textAlign: "center", fontSize: "0.8rem" }}>Year: {s.year}</Typography>
                      <Typography sx={{ textAlign: "center", fontSize: "0.8rem", color: s.approved ? "green" : "red" }}>
                        {s.approved ? "Approved" : "Pending"}
                      </Typography>

                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1, flexWrap: "wrap" }}>
                        {!s.approved && (
                          <Button variant="contained" color="success" size="small" onClick={() => handleApprove(s.id)}>
                            Approve
                          </Button>
                        )}
                        <Button variant="outlined" size="small" onClick={() => setEditStudent(s)}>Edit</Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(s.id)}>Delete</Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        ))}
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={!!editStudent} onClose={() => setEditStudent(null)}>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          {editStudent && ["name", "email", "year"].map(field => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              value={editStudent[field]}
              onChange={e => setEditStudent({ ...editStudent, [field]: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
          ))}
          {editStudent && (
            <FormControlLabel
              control={
                <Switch
                  checked={editStudent.approved}
                  onChange={e => setEditStudent({ ...editStudent, approved: e.target.checked })}
                />
              }
              label="Approved"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditStudent(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
