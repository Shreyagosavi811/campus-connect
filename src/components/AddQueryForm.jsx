
import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; 
import "../styles/queries.css";

export default function AddQueryForm({ onPosted }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [postedBy, setPostedBy] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setPostedBy("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setMessage("Please add a title and description.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      
      const queriesRef = collection(db, "queries");

      
      const docRef = await addDoc(queriesRef, {
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || "General",
        postedBy: postedBy.trim() || "Anonymous",
        date_posted: serverTimestamp(), 
        status: "open", 
      });

      if (onPosted) onPosted({ id: docRef.id, title: title.trim() });

      setMessage("Query posted successfully!");
      resetForm();
    } catch (err) {
      console.error("Error adding query:", err);
      setMessage("Failed to post. Please try again.");
    }

    setLoading(false);

   
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="add-query-card">
      <h3>Ask a Question</h3>
      <form onSubmit={handleSubmit} className="add-query-form">
        <input
          type="text"
          placeholder="Title (short)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
        />
        <textarea
          placeholder="Explain your question in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Category (e.g., Academics, Career)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="text"
          placeholder="Your name (optional)"
          value={postedBy}
          onChange={(e) => setPostedBy(e.target.value)}
        />
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Posting..." : "Post Query"}
          </button>
        </div>
        {message && <div className="form-message">{message}</div>}
      </form>
    </div>
  );
}
