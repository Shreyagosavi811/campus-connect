import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext";
import "../styles/globals.css";
import "../styles/Navbar.css";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ Restore user from localStorage (to persist after refresh)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && !user) {
      setUser(JSON.parse(storedUser));
    }
  }, [user, setUser]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/"); // redirect to login
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const links = [
    { label: "Home", path: "/home" },
    { label: "Notices", path: "/notices" },
    { label: "Lost & Found", path: "/lostfound" },
    { label: "Mentorship & Queries", path: "/queries" },
  ];

  // Role-based links 
  if (user?.role === "admin") links.push({ label: "Admin Panel", path: "/admin" });
  if (user?.role === "hod") links.push({ label: "HOD Panel", path: "/hod" });
  if (user?.role === "teacher") links.push({ label: "Teacher Panel", path: "/teacher" });

  return (
    <AppBar position="static" className="navbar">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Campus Connect
        </Typography>

        {/* Desktop Links */}
        <Box className="navbar-links-desktop">
          {user &&
            links.map((link) => (
             <Button
  key={link.label}
  color="inherit"
  component={NavLink}
  to={link.path}
  className={({ isActive }) => (isActive ? "active" : "")}
>
  {link.label}
</Button>
            ))}
          {user && (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Box>

        {/* Mobile Menu */}
        {user && (
          <>
            <IconButton
              color="inherit"
              edge="end"
              sx={{ display: { xs: "block", md: "none" } }}
              onClick={toggleMobileMenu}
            >
              <MenuIcon />
            </IconButton>

            <Drawer anchor="right" open={mobileOpen} onClose={toggleMobileMenu}>
              <List sx={{ width: 250 }}>
                {links.map((link) => (
                  <ListItem
                    button
                    key={link.label}
                    component={Link}
                    to={link.path}
                    onClick={toggleMobileMenu}
                  >
                    <ListItemText primary={link.label} />
                  </ListItem>
                ))}
                <ListItem
                  button
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                >
                  <ListItemText primary="Logout" />
                </ListItem>
              </List>
            </Drawer>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
