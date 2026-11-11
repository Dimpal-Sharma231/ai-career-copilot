import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadResume, getUserResumes, getResumeById, exportAtsResume } from '../controllers/resume.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Ensure uploads/ directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer disk storage: temporary staging in backend/uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB maximum file size limit
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const validMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (validExtensions.includes(ext) || validMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('INVALID_FILE_TYPE'));
    }
  }
});

// Middleware wrapper to catch Multer errors cleanly and return JSON 400
const uploadSingleResume = (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File size exceeds 5MB limit. Please upload a smaller document.',
          message: 'File size exceeds 5MB limit. Please upload a smaller document.'
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Please upload a valid PDF document.',
        message: 'Please upload a valid PDF document.'
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a valid PDF document.',
        message: 'Please upload a valid PDF document.'
      });
    }
    next();
  });
};

// Resume API routes
router.post('/upload', authenticateToken, uploadSingleResume, uploadResume);
router.get('/export', authenticateToken, exportAtsResume);
router.get('/', authenticateToken, getUserResumes);
router.get('/:id', authenticateToken, getResumeById);

export default router;
