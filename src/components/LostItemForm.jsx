import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; 
import "../styles/LostFound.css";

const LostItemForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // API Key for imgbb
  const IMGBB_API_KEY = "3762ab13c55ff6c4cfba5b63dba662dd";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = "";

    // Upload image to ImgBB if selected
    if (image) {
      try {
        const formData = new FormData();
        formData.append("image", image);

        const res = await fetch(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        if (data.success) {
          imageUrl = data.data.url;
        } else {
          throw new Error("Image upload failed");
        }
      } catch (err) {
        console.error("Image upload error:", err);
        alert("Image upload failed. Try again.");
        setLoading(false);
        return;
      }
    }
    try {
      await addDoc(collection(db, "lost_items"), {
        title,
        description,
        category,
        location,
        imageUrl,
        date_reported: serverTimestamp(),
        status: "lost",
      });

      alert("Lost item reported successfully!");
      setTitle("");
      setDescription("");
      setCategory("");
      setLocation("");
      setImage(null);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to report item. Try again.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="lost-item-form">
      <h2>Report Lost Item</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Category (phone, wallet, keys...)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default LostItemForm;
