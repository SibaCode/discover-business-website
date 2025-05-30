// routes/businesses.js
const express = require("express");
const { db } = require("../firebase");

const router = express.Router();
const collection = db.collection("businesses");

// Create
router.post("/", async (req, res) => {
  try {
    const docRef = await collection.add(req.body);
    res.status(201).json({ id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read All
router.get("/", async (req, res) => {
  try {
    const snapshot = await collection.get();
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read One
router.get("/:id", async (req, res) => {
  try {
    const doc = await collection.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    await collection.doc(req.params.id).update(req.body);
    res.json({ message: "Updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    await collection.doc(req.params.id).delete();
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
