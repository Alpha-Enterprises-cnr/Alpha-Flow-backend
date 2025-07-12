const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const formHandler = require('./routes/formHandler');

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Allow CORS from frontend deployed on Vercel
app.use(cors({
  origin: [
    'https://alpha-flow-frontend.vercel.app',
    'https://alpha-flow-frontend-git-main-alphacnr.vercel.app'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// ✅ Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`🌐 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`📦 Origin: ${req.headers.origin}`);
  next();
});

// ✅ Parse incoming JSON bodies
app.use(express.json());

// ✅ Add middleware to catch malformed JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('🛑 Bad JSON:', err.message);
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next();
});

// ✅ Routes
app.use('/api', formHandler);

app.get('/', (req, res) => {
  res.send('✅ Backend is up and ready!');
});

// ✅ Ensure directory existence
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const uploadsPath = path.join(__dirname, 'uploads');
const filesPath = path.join(__dirname, 'brsFiles');
ensureDir(uploadsPath);
ensureDir(filesPath);

// ✅ Static file serving
app.use('/uploads', express.static(uploadsPath));
app.use('/brsFiles', express.static(filesPath));

// ✅ File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// ✅ File Upload Endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
  res.json({ filename: file.filename, url: fileUrl });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
