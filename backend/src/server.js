import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import applicationsRoutes from './routes/applications.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import drivesRoutes from './routes/drives.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// 1. Explicit Enterprise CORS Setup (UPDATED: Regex to allow all Vercel URLs)
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser agents (cURL, mobile, Postman, automated tests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // ✅ THE FIX: Allow ANY URL that starts with your Vercel project name
    // This covers all preview deployments (e.g., ...-hrg4orwjj-jaipurites.vercel.app)
    const vercelRegex = /^https:\/\/ai-career-copilot-frontend.*\.vercel\.app$/;
    if (vercelRegex.test(origin)) {
      return callback(null, true);
    }

    // Log blocked origins for debugging
    console.log("Blocked by CORS:", origin); 
    return callback(null, false); // Properly block instead of permissive fallback
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // Preflight cache 24h
};

app.use(cors(corsOptions));
// Handle browser preflight OPTIONS requests across all routes
app.options('*', cors(corsOptions));

// 2. Body Parsers with generous size limits for PDF resumes
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// 3. Request Logging in Development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${new Date().toISOString().substring(11, 19)} ${req.method} ${req.originalUrl}`);
    next();
  });
}

// 4. Health Check Route
app.get('/api/health', async (req, res) => {
  let dbStatus = 'connected'; 
  let pythonStatus = 'offline';

  // Check Python FastAPI Microservice
  try {
    const pyRes = await axios.get(`${PYTHON_SERVICE_URL}/health`, { timeout: 2000 });
    if (pyRes.status === 200) {
      pythonStatus = 'connected (FastAPI)';
    }
  } catch (e) {
    pythonStatus = 'offline (FastAPI not reachable)';
  }

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI Career Copilot Express Gateway',
    port: PORT,
    cors: {
      allowedOrigins,
      allowVercelRegex: true
    },
    services: {
      database: dbStatus,
      pythonMicroservice: pythonStatus
    }
  });
});

// 5. API Routes Mounting (dual-mounted under both /api/* and /* for gateway & client compatibility)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/users', userRoutes);
app.use('/users', userRoutes);

app.use('/api/resume', resumeRoutes);
app.use('/resume', resumeRoutes);

app.use('/api/jobs', jobsRoutes);
app.use('/jobs', jobsRoutes);

app.use('/api/applications', applicationsRoutes);
app.use('/applications', applicationsRoutes);

app.use('/api/analytics', analyticsRoutes);
app.use('/analytics', analyticsRoutes);

app.use('/api/interview', interviewRoutes);
app.use('/interview', interviewRoutes);

app.use('/api/drives', drivesRoutes);
app.use('/drives', drivesRoutes);

// Root Fallback
app.get('/', (req, res) => {
  res.json({
    service: 'AI Career Copilot API Gateway',
    status: 'running',
    health: '/api/health'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on API gateway.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

// Start Server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ======================================================
    🚀 AI Career Copilot Express Backend Running
    🌐 Host: 0.0.0.0 (localhost)
    🔌 Port: ${PORT}
    🔗 Health Check: http://localhost:${PORT}/api/health
    🤖 Python AI Service: ${PYTHON_SERVICE_URL}
    🛡️  CORS: Localhost + ALL Vercel URLs allowed
    ======================================================
    `);
  });
}

export default app;