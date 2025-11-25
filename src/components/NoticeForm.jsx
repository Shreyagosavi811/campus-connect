import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import { TextField, Button, MenuItem, Box, Paper, Typography, LinearProgress, Snackbar } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import "../styles/NoticeBoard.css";
import { FormControl, InputLabel, Select } from "@mui/material";
const categories = ["Exam", "Placement", "Cultural", "Other"];
const departments = ["All", "Computer Engineering", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering"];
const years = ["All", "1st", "2nd", "3rd", "4th"];
const IMGBB_API_KEY = "3762ab13c55ff6c4cfba5b63dba662dd";

export default function NoticeForm({ onAdded }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Exam");
  const [department, setDepartment] = useState("All");
  const [year, setYear] = useState("All");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null);
  const [openSnack, setOpenSnack] = useState(false);
  const [userData, setUserData] = useState({ name: "", role: "", department: "" });


  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          let userSnap;

          if (user.uid) {
            
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              userSnap = docSnap.data();
            }
          }

          if (!userSnap && user.email) {
           
            const q = query(collection(db, "users"), where("email", "==", user.email));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
              userSnap = querySnap.docs[0].data();
            }
          }

          if (userSnap) {
            setUserData(userSnap);
          } else {
            setUserData({
              name: user.displayName || user.email.split("@")[0],
              role: "User",
              department: "Unknown",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // upload image to ImgBB
  const uploadImageToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data?.data?.url || "";
  };

  //  Submit Notice
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = "";
      if (image) {
        setUploading(true);
        imageUrl = await uploadImageToImgBB(image);
        setUploading(false);
      }

      await addDoc(collection(db, "notices"), {
        title,
        description,
        category,
        department,
        year,
        imageUrl,
        postedBy: userData.name || user.displayName || user.email.split("@")[0],
        role: userData.role || "User",
        postedByDepartment: userData.department || "Unknown",
        timestamp: serverTimestamp(),
      });

      setTitle("");
      setDescription("");
      setCategory("Exam");
      setDepartment("All");
      setYear("All");
      setImage(null);
      setOpenSnack(true);
      if (onAdded) onAdded();
    } catch (err) {
      console.error("Error adding notice:", err);
    }
    setLoading(false);
  };

  return (
    <Paper elevation={5} sx={{ p: 4, mb: 4, borderRadius: 3, maxWidth: 700, margin: "2rem auto" }}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}>
         Post New Notice
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField label="Title" fullWidth required value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField
          label="Description"
          fullWidth
          required
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 2,
    justifyContent: "center",
    alignItems: "center",
    "@media (max-width: 768px)": {
      flexDirection: "column",
      gap: 1.5,
    },
  }}
>
  <FormControl sx={{ flex: 1, minWidth: { xs: "100%", sm: "30%" } }}>
    <TextField
      select
      label="Category"
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      fullWidth
      size="small"
      sx={{
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 2,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#cbd5e1",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#9333ea",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#9333ea",
          boxShadow: "0 0 0 3px rgba(147, 51, 234, 0.2)",
        },
      }}
    >
      {categories.map((cat) => (
        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
      ))}
    </TextField>
  </FormControl>

  <FormControl sx={{ flex: 1, minWidth: { xs: "100%", sm: "30%" } }}>
    <TextField
      select
      label="Department"
      value={department}
      onChange={(e) => setDepartment(e.target.value)}
      fullWidth
      size="small"
      sx={{
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 2,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#cbd5e1",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#9333ea",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#9333ea",
          boxShadow: "0 0 0 3px rgba(147, 51, 234, 0.2)",
        },
      }}
    >
      {departments.map((dep) => (
        <MenuItem key={dep} value={dep}>{dep}</MenuItem>
      ))}
    </TextField>
  </FormControl>

  <FormControl sx={{ flex: 1, minWidth: { xs: "100%", sm: "30%" } }}>
    <TextField
      select
      label="Year"
      value={year}
      onChange={(e) => setYear(e.target.value)}
      fullWidth
      size="small"
      sx={{
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 2,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#cbd5e1",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#9333ea",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#9333ea",
          boxShadow: "0 0 0 3px rgba(147, 51, 234, 0.2)",
        },
      }}
    >
      {years.map((y) => (
        <MenuItem key={y} value={y}>{y}</MenuItem>
      ))}
    </TextField>
  </FormControl>
</Box>


        <div className="upload-section">
          <Button variant="outlined" component="label" color="secondary"  >
            {image ? "Change Image" : "Upload Image"}
            <input type="file" hidden accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          </Button>
          {image && <p className="file-name">{image.name}</p>}
        </div>

        {uploading && <LinearProgress color="secondary" />}

        <Button variant="contained" color="primary" type="submit" disabled={loading || uploading}>
          {loading ? "Posting..." : "Post Notice"}
        </Button>
      </Box>

      <Snackbar open={openSnack} autoHideDuration={3000} onClose={() => setOpenSnack(false)} message="✅ Notice posted successfully!" />
    </Paper>
  );
}
