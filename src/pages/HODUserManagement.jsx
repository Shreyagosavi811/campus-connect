import { useEffect, useState } from "react";
import emailjs from "emailjs-com";
import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  Container, Typography, Grid, Paper, Box, TextField,
  Select, MenuItem, Button, Tabs, Tab, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch, Avatar
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import "../styles/HODDashboard.css";

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ mt: 2 }}>{children}</Box>}</div>;
}

export default function HodUserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "student", year: "" });
  const [tabIndex, setTabIndex] = useState(0);
  const [editUser, setEditUser] = useState(null);

  const roles = ["student", "teacher", "pending"];

  // Fetch users
  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const deptUsers = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(u => u.department === user?.department && (["student", "teacher"].includes(u.role)));
    setUsers(deptUsers);
  };

  useEffect(() => { if (user) fetchUsers(); }, [user]);

  // Add Student
const handleAddUser = async () => {
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

  // ✅ Send email with credentials
  const templateParams = {
    name: form.name,
    email: form.email,
    password,
  };

  emailjs
    .send("service_ydtu7jp", "template_etypntv", templateParams, "NN3gMWSv34ggrAvsV")
    .then(
      () => {
        alert(`✅ User added and email sent to ${form.email}`);
      },
      (error) => {
        console.error("❌ Failed to send email:", error);
        alert("User added but email could not be sent.");
      }
    );
  setForm({ name: "", email: "", role: "student", year: "" });
  fetchUsers();
};  


  // Update user
  const handleUpdate = async () => {
    if (!editUser) return;
    await updateDoc(doc(db, "users", editUser.id), editUser);
    setEditUser(null);
    fetchUsers();
  };

  // Delete user
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteDoc(doc(db, "users", id));
      fetchUsers();
    }
  };

  // Approve user
  const handleApprove = async (id) => {
    await updateDoc(doc(db, "users", id), { approved: true });
    fetchUsers();
  };

  const handleTabChange = (e, newValue) => setTabIndex(newValue);

  // Filter users
  const students = users.filter(u => u.role === "student" && u.approved);
  const teachers = users.filter(u => u.role === "teacher" && u.approved);
  const pending = users.filter(u => !u.approved);

  const filteredUsers = [students, teachers, pending];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        HOD User Management - {user?.department} Department
      </Typography>

      {/* Add User Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Add New User</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <Select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value, year: "" })}
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
          </Select>
          {form.role === "student" && (
            <Select
              value={form.year || ""}
              onChange={e => setForm({ ...form, year: e.target.value })}
              displayEmpty
            >
              <MenuItem value="" disabled>Select Year</MenuItem>
              <MenuItem value="1">1st Year</MenuItem>
              <MenuItem value="2">2nd Year</MenuItem>
              <MenuItem value="3">3rd Year</MenuItem>
              <MenuItem value="4">4th Year</MenuItem>
            </Select>
          )}
          <Button variant="contained" onClick={handleAddUser}>Add User</Button>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ p: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Students" />
          <Tab label="Teachers" />
          <Tab label={`Pending Approvals (${pending.length})`} />
        </Tabs>

        {filteredUsers.map((userList, i) => (
          <TabPanel key={i} value={tabIndex} index={i}>
            {userList.length === 0 ? (
              <Typography sx={{ mt: 2 }}>No users found.</Typography>
            ) : (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {userList.map(u => (
                  <Grid item xs={12} sm={6} md={4} key={u.id}>
                    <Paper className="user-card" elevation={3} sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                        <Avatar sx={{ bgcolor: "#2563EB", width: 56, height: 56 }}>
                          <PersonIcon fontSize="large" />
                        </Avatar>
                      </Box>
                      <Typography sx={{ fontWeight: "bold", textAlign: "center" }}>{u.name}</Typography>
                      <Typography sx={{ textAlign: "center" }}>{u.role}</Typography>
                      {u.role === "student" && (
                        <Typography sx={{ textAlign: "center", fontSize: "0.8rem" }}>Year: {u.year}</Typography>
                      )}
                      <Typography sx={{ textAlign: "center", fontSize: "0.8rem", color: u.approved ? "green" : "red" }}>
                        {u.approved ? "Approved" : "Pending"}
                      </Typography>

                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1, flexWrap: "wrap" }}>
                        {!u.approved && (
                          <Button variant="contained" color="success" size="small" onClick={() => handleApprove(u.id)}>
                            Approve
                          </Button>
                        )}
                        <Button variant="outlined" size="small" onClick={() => setEditUser(u)}>Edit</Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(u.id)}>Delete</Button>
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
      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editUser && ["name", "email", "role"].map(field => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              value={editUser[field]}
              onChange={e => setEditUser({ ...editUser, [field]: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
          ))}
          {editUser && editUser.role === "student" && (
            <Select
              value={editUser.year || ""}
              onChange={e => setEditUser({ ...editUser, year: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="" disabled>Select Year</MenuItem>
              <MenuItem value="1">1st Year</MenuItem>
              <MenuItem value="2">2nd Year</MenuItem>
              <MenuItem value="3">3rd Year</MenuItem>
              <MenuItem value="4">4th Year</MenuItem>
            </Select>
          )}
          {editUser && (
            <FormControlLabel
              control={
                <Switch
                  checked={editUser.approved}
                  onChange={e => setEditUser({ ...editUser, approved: e.target.checked })}
                />
              }
              label="Approved"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
