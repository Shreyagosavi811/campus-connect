// src/pages/LostFoundPage.jsx
import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import LostItemForm from "../components/LostItemForm";
import LostItemsList from "../components/LostItemsList";
import FoundItemForm from "../components/FoundItemForm";
import FoundItemsList from "../components/FoundItemsList";
import "../styles/queries.css";

const LostFoundPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: "20px auto", px: 2 }}>
      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleChange}
        centered
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Lost Items" />
        <Tab label="Found Items" />
      </Tabs>

      {/* Tab Panels */}
      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && (
          <Box className="lostfound-section">
            <LostItemForm />
            <LostItemsList />
          </Box>
        )}
        {tabValue === 1 && (
          <Box className="lostfound-section">
            <FoundItemForm />
            <FoundItemsList />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LostFoundPage;
