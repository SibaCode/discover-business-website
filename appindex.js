require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const admin = require("firebase-admin");
const app = express();
app.options('*', cors());

// Firebase setup
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// const serviceAccount = require("./config/new-serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

app.use(cors({
  origin: '',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
// // Your Firestore db instance (make sure it's initialized properly)
// https://discover-business-backend.vercel.app
// https://discover-business-backend.vercel.app/
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer storage config

// const upload = multer({ storage: storage });
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });
app.get('/', (req, res) => {
  res.send('Welcome to the Business API');
});

// Allow fields: image (single), productImages (multiple)
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'productImages', maxCount: 10 } // or whatever max you want
]);
// const multipleUpload = upload.fields([
//   { name: 'image', maxCount: 1 },            // existing logo field
//   { name: 'productImages', maxCount: 10 }    // new product images field
// ]);
// CREATE - Add new business with optional image upload
app.post("/api/businesses", uploadFields, async (req, res) => {
  try {
    const newBusiness = req.body;
    if (req.files['image']) {
      newBusiness.imageUrl = req.files['image'][0].path;
    }
console.log('Received files:', req.files);
console.log('Received body:', req.body);

    // Handle product images
    if (req.files['productImages']) {
      newBusiness.productImages = req.files['productImages'].map(file => file.path);
    }
    const docRef = await db.collection("businesses").add(newBusiness);
    res.status(201).json({ message: "Business created successfully", id: docRef.id, ...newBusiness });
  } catch (error) {
    res.status(500).json({ error: "Failed to create business", details: error.message });
  }
});

// READ ALL
app.get("/api/businesses", async (req, res) => {
  try {
    const snapshot = await db.collection("businesses").get();
    const businesses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(businesses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch businesses", details: error.message });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const eventsRef = db.collection('events');
    const snapshot = await eventsRef.get();
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});
app.get("/api/businesses/:id", async (req, res) => {
  try {
    const businessRef = db.collection("businesses").doc(req.params.id);
    const doc = await businessRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Business not found" });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch business", details: error.message });
  }
});

// UPDATE
app.put("/api/businesses/:id", uploadFields, async (req, res) => {
  try {
    const businessRef = db.collection("businesses").doc(req.params.id);
    const doc = await businessRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Business not found" });
    }

    const updateData = req.body;
    if (req.files['image']) {
      updateData.imageUrl = `/uploads/${req.files['image'][0].filename}`;
    }

    if (req.files['productImages']) {
      updateData.productImages = req.files['productImages'].map(file => `/uploads/${file.filename}`);
    }

    await businessRef.update(updateData);
    const updatedDoc = await businessRef.get();
    res.status(200).json({ message: "Business updated successfully", id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ error: "Failed to update business", details: error.message });
  }
});

// DELETE
app.delete("/api/businesses/:id", async (req, res) => {
  try {
    const businessRef = db.collection("businesses").doc(req.params.id);
    const doc = await businessRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Business not found" });
    }

    await businessRef.delete();
    res.status(200).json({ message: "Business deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete business", details: error.message });
  }
});



// Start server
const PORT = process.env.PORT ||4000;
app.listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});


