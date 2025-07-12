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
  origin: ['https://alpha-flow-frontend-git-main-alphacnr.vercel.app'.
          'https://alpha-flow-frontend.vercel.app'],
  
  methods: ['GET', 'POST','OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ✅ Middleware to log all incoming requests (for debugging)
app.use((req, res, next) => {
  console.log(`🌐 Request from: ${req.method} ${req.url}`);
  console.log(`📦 Origin: ${req.headers.origin}`);
  next();
});

app.use(express.json());

// ✅ API Routes
app.use('/api', formHandler);

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('✅ Backend is running and ready to receive requests!');
});

// ✅ Ensure directories exist
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const filesPath = path.join(__dirname, 'brsFiles');
const uploadsPath = path.join(__dirname, 'uploads');
ensureDir(filesPath);
ensureDir(uploadsPath);

// ✅ Serve static files
app.use('/brsFiles', express.static(filesPath));
app.use('/uploads', express.static(uploadsPath));

// ✅ File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ✅ Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
  res.json({ filename: file.filename, url: fileUrl });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});
