import express from "express";
import CalendarItem from "../models/CalendarItem.js"; // Import the model we just made

const router = express.Router();

// Route to add calendar item
router.post("/add-item", async (req, res) => {
  console.log("Received Data:", req.body);
  try {
    const { id, type, name, date, time, notes, auth0Id } = req.body;
    
    // Create and save the new item
    const newItem = new CalendarItem({ id, type, name, date, time, notes, auth0Id });
    await newItem.save();
    
    res.status(201).json({ success: true, message: "Item added!" });
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route to fetch calendar items
router.get("/get-items", async (req, res) => {
  try {
    // We will later update this to only find items for the logged-in Auth0 user!
    const items = await CalendarItem.find(); 
    res.status(200).json({ success: true, items });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;