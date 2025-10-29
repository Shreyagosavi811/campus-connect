// src/components/FoundItemsList.js
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/LostFound.css";

const FoundItemsList = () => {
  const [foundItems, setFoundItems] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "found_items"),
      orderBy("date_reported", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFoundItems(items);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="items-container">
      {foundItems.length === 0 && <p>No found items reported yet.</p>}
      {foundItems.map((item) => (
        <div className="item-card" key={item.id}>
          {item.imageUrl && (
            <div className="item-image">
              <img src={item.imageUrl} alt={item.title} />
            </div>
          )}
          <div className="item-details">
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            <small>Category: {item.category}</small>
            <small>Location: {item.location}</small>
            {item.date_reported?.seconds && (
              <small>
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

export default FoundItemsList;
