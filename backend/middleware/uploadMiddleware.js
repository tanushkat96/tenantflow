const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Avatar uploads ────────────────────────────────────────────
const avatarsDir = 'uploads/avatars/';
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
  console.log('📁 Created uploads directory:', avatarsDir);
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ── Task-asset uploads ────────────────────────────────────────
const tasksDir = 'uploads/tasks/';
if (!fs.existsSync(tasksDir)) {
  fs.mkdirSync(tasksDir, { recursive: true });
  console.log('📁 Created uploads directory:', tasksDir);
}

const taskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/tasks/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'task-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const taskUpload = multer({
  storage: taskStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

// ── Exports ───────────────────────────────────────────────────
upload.taskUpload = taskUpload;

module.exports = upload;