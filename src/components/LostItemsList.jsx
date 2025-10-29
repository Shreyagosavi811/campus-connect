// src/components/LostItemsList.js
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/LostFound.css";

const LostItemsList = () => {
  const [lostItems, setLostItems] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "lost_items"),
      orderBy("date_reported", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLostItems(items);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="items-container">
      {lostItems.length === 0 && <p>No lost items reported yet.</p>}
      {lostItems.map((item) => (
        <div className="item-card" key={item.id}>
          {item.imageUrl && (
            <div className="item-image">
              <img src={item.imageUrl} alt={item.title} />
            </div>
          )}
          <div className="item-details">
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            <small>Category: {item.category}</small><br></br>
            <small>Location: {item.location}</small><br></br>
            {item.date_reported && (
              <small><br></br>
                Reported:{" "}
                {new Date(item.date_reported.seconds * 1000).toLocaleString()}
              </small>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LostItemsList;
