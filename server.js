const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const formHandler = require('./routes/formHandler'); // ✅ Import form logic

const app = express();
const PORT = 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json()); // ✅ This enables parsing of JSON in POST requests

// ✅ Excel form API handler
app.use('/api', formHandler);

// ✅ Serve static Excel files
const filesPath = path.join(__dirname, 'brsFiles');
if (!fs.existsSync(filesPath)) {
  fs.mkdirSync(filesPath, { recursive: true });
}
app.use('/brsFiles', express.static(filesPath));

// ✅ File upload setup with multer
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// ✅ File upload route
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  res.json({
    filename: file.filename,
    url: `http://localhost:${PORT}/uploads/${file.filename}`,
  });
});

// ✅ Serve uploaded files
app.use('/uploads', express.static(uploadsPath));

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Backend is running');
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});
