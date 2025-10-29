import emailjs from "emailjs-com";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Box,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Avatar,
  Select,
  MenuItem,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import "../styles/AdminDashboard.css";

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ mt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Student",
    department: "",
    year: "",
  });
  const [tabIndex, setTabIndex] = useState(0);
  const [editUser, setEditUser] = useState(null);

  const roles = ["HOD", "Teacher", "Student", "Pending Approval"];

  // Fetch users from Firestore
  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  function generatePassword(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!&";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}


// Add new user
const handleAdd = async () => {
  if (!form.name || !form.email || !form.role || !form.department)
    return alert("Please fill all required fields");

  const password = generatePassword();

  await addDoc(collection(db, "users"), {
    ...form,
    password,
    approved: false,
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

  setForm({ name: "", email: "", role: "Student", department: "", year: "" });
  fetchUsers();
};

  // Update user (edit)
  const handleUpdate = async () => {
    if (!editUser) return;
    await updateDoc(doc(db, "users", editUser.id), { ...editUser });
    setEditUser(null);
    fetchUsers();
  };

  // Approve user
  const handleApprove = async (user) => {
    await updateDoc(doc(db, "users", user.id), { approved: true });
    fetchUsers();
  };

  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  // Filter users by role and pending status
  const filteredUsers = [
    users.filter((u) => u.role?.toLowerCase() === "hod"),
    users.filter((u) => u.role?.toLowerCase() === "teacher"),
    users.filter((u) => u.role?.toLowerCase() === "student"),
    users.filter((u) => !u.approved),
  ];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Admin User Management
      </Typography>

      <Grid container spacing={3}>
        {/* Add User Form */}
        <Grid item xs={12} md={4}>
          <Paper className="admin-form" elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Add New User
            </Typography>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value, year: "" })
              }
              fullWidth
              sx={{ mb: 2 }}
            >
              {["HOD", "Teacher", "Student"].map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
            <TextField
              label="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            {form.role === "Student" && (
              <Select
                value={form.year || ""}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
              >
                <MenuItem value="" disabled>
                  Select Year
                </MenuItem>
                <MenuItem value="1">1st Year</MenuItem>
                <MenuItem value="2">2nd Year</MenuItem>
                <MenuItem value="3">3rd Year</MenuItem>
                <MenuItem value="4">4th Year</MenuItem>
              </Select>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleAdd}
              fullWidth
            >
              Add User
            </Button>
          </Paper>
        </Grid>

        {/* User Tabs */}
        <Grid item xs={12} md={8}>
          <Paper elevation={8} sx={{ p: 2 }}>
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
            >
              {roles.map((role, i) => (
                <Tab key={i} label={role} />
              ))}
            </Tabs>

            {filteredUsers.map((userList, i) => (
              <TabPanel key={i} value={tabIndex} index={i}>
                {userList.length === 0 ? (
                  <Typography sx={{ mt: 2 }}>No users found.</Typography>
                ) : (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {userList.map((user) => (
                      <Grid item xs={12} sm={6} md={4} key={user.id}>
                        <Paper
                          className="user-tile"
                          elevation={3}
                          sx={{
                            p: 2,
                            textAlign: "center",
                            borderRadius: "12px",
                            transition: "0.3s",
                            "&:hover": { transform: "scale(1.04)" },
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: user.approved ? "#16a34a" : "#2563EB",
                              width: 56,
                              height: 56,
                              mx: "auto",
                              mb: 1,
                            }}
                          >
                            <PersonIcon fontSize="large" />
                          </Avatar>
                          <Typography sx={{ fontWeight: "bold" }}>
                            {user.name}
                          </Typography>
                          <Typography>{user.role}</Typography>
                          <Typography sx={{ fontSize: "0.9rem" }}>
                            {user.email}
                          </Typography>
                          <Typography sx={{ fontSize: "0.8rem" }}>
                            {user.department}{" "}
                            {user.role === "Student" &&
                              `| Year: ${user.year || "N/A"}`}
                          </Typography>
                          <Typography
                            sx={{
                              color: user.approved ? "green" : "red",
                              fontWeight: 600,
                              fontSize: "0.85rem",
                            }}
                          >
                            {user.approved ? "Approved" : "Pending Approval"}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 1,
                              mt: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            {!user.approved && (
                              <Button
                                variant="contained"
                                size="small"
                                color="success"
                                onClick={() => handleApprove(user)}
                              >
                                Approve
                              </Button>
                            )}
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setEditUser(user)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleDelete(user.id)}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </TabPanel>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editUser &&
            ["name", "email", "role", "department", "year"].map((field) => (
              <TextField
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                value={editUser[field] || ""}
                onChange={(e) =>
                  setEditUser({ ...editUser, [field]: e.target.value })
                }
                fullWidth
                sx={{ mb: 2 }}
              />
            ))}
          {editUser && (
            <FormControlLabel
              control={
                <Switch
                  checked={editUser.approved}
                  onChange={(e) =>
                    setEditUser({ ...editUser, approved: e.target.checked })
                  }
                />
              }
              label="Approved"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
