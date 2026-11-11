import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import prisma from '../config/prisma.js';
import { calculateProfileStrength } from './user.controller.js';
import { ResumePdfService } from '../services/resume-pdf.service.js';
import { ReadinessService } from '../services/readiness.service.js';

const require = createRequire(import.meta.url);
let pdfParse = null;
try {
  pdfParse = require('pdf-parse/lib/pdf-parse.js');
} catch (e1) {
  try {
    pdfParse = require('pdf-parse');
  } catch (e2) {
    console.warn('[Resume Controller] pdf-parse library could not be loaded:', e2.message);
  }
}

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

const DEFAULT_TECH_SKILLS = [
  'Python', 'TypeScript', 'JavaScript', 'React', 'Node.js', 'Express', 'FastAPI',
  'PostgreSQL', 'Prisma', 'MongoDB', 'Redis', 'Docker', 'AWS', 'Kubernetes',
  'Git', 'Tailwind CSS', 'Next.js', 'PyTorch', 'scikit-learn', 'TF-IDF',
  'GraphQL', 'REST APIs', 'CI/CD', 'C++', 'Go', 'Java', 'Linux', 'SQL',
  'Jest', 'Cypress', 'System Design', 'Microservices', 'DSA', 'Algorithms'
];

// Helper to safely serialize skills for SQLite
const serializeSkills = (skills) => {
  if (typeof skills === 'string') return skills;
  return JSON.stringify(skills || []);
};

// Helper to safely parse skills from SQLite
const parseSkills = (skills) => {
  if (Array.isArray(skills)) return skills;
  try {
    return JSON.parse(skills || '[]');
  } catch {
    return [];
  }
};

/**
 * Calculate Shortlist Score based on skill richness and engineering depth
 */
const computeShortlistScore = (skillsArray = []) => {
  const baseScore = 75;
  const countBonus = Math.min(18, Math.round(skillsArray.length * 1.8));
  const hasCore = skillsArray.some(s => ['C++', 'Java', 'Python', 'Go', 'Rust'].includes(s));
  const hasWeb = skillsArray.some(s => ['React', 'Node.js', 'Next.js', 'Express', 'FastAPI'].includes(s));
  const hasDb = skillsArray.some(s => ['SQL', 'PostgreSQL', 'MongoDB', 'Redis'].includes(s));

  let bonus = 0;
  if (hasCore) bonus += 2;
  if (hasWeb) bonus += 2;
  if (hasDb) bonus += 2;

  return Math.min(96, Math.max(76, baseScore + countBonus + bonus));
};

/**
 * Upload and parse PDF Resume
 * Route: POST /api/resume/upload
 */
export const uploadResume = async (req, res) => {
  let filePath = req.file?.path;
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a valid PDF document.',
        message: 'Please upload a valid PDF document.'
      });
    }

    const { originalname, filename } = req.file;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User session required for resume upload.'
      });
    }

    const fileUrl = `/uploads/${filename}`;
    const fileBuffer = fs.readFileSync(filePath);

    // Step 1: Use pdf-parse in Node.js to extract text from the buffer
    let rawText = '';
    if (pdfParse) {
      try {
        const parsed = await pdfParse(fileBuffer);
        rawText = parsed?.text || '';
      } catch (parseErr) {
        console.warn('[Resume Controller] pdf-parse extraction failure:', parseErr.message);
      }
    }

    // Guardrail: If extracted text is empty or undefined, immediately return 400 Bad Request
    if (!rawText || !rawText.trim()) {
      if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
      return res.status(400).json({
        success: false,
        error: 'This PDF appears to be scanned. Please upload a text-based PDF.',
        message: 'This PDF appears to be scanned. Please upload a text-based PDF.'
      });
    }

    // Step 2: Trim text, remove weird unicode characters (like \u200b zero-width space, BOM, control chars)
    const cleanedText = rawText
      .replace(/[\u200B-\u200D\uFEFF\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n+/g, '\n\n')
      .trim();

    // Guardrail: If text is under 50 characters long
    if (cleanedText.length < 50) {
      if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
      return res.status(400).json({
        success: false,
        error: 'Text too short. The document is empty or corrupted.',
        message: 'Text too short. The document is empty or corrupted.'
      });
    }

    let extractedText = cleanedText;
    let skillsArray = [];
    let aiServiceSuccess = false;

    // Step 3: Forward cleaned text to Python FastAPI microservice (/api/extract)
    try {
      console.log(`[Resume Controller] Dispatching cleaned text to Python AI Service: ${PYTHON_SERVICE_URL}/api/extract`);
      const aiResponse = await axios.post(`${PYTHON_SERVICE_URL}/api/extract`, {
        text: cleanedText,
        fileName: originalname
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      if (aiResponse.data) {
        extractedText = aiResponse.data.extractedText || cleanedText;
        skillsArray = aiResponse.data.skills || [];
        aiServiceSuccess = true;
      }
    } catch (aiError) {
      console.warn(`[Resume Controller] Python microservice error (${aiError.message})`);

      // Catch strict validation or guardrail failure from Python
      if (aiError.response && aiError.response.status === 400) {
        if (filePath && fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch {}
        }
        const validationError = aiError.response.data?.detail || aiError.response.data?.error || 'Invalid Document. Please upload a standard Resume.';
        return res.status(400).json({
          success: false,
          error: validationError,
          message: validationError
        });
      }

      // If AI service returned 422 (scanned)
      if (aiError.response && aiError.response.status === 422) {
        if (filePath && fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch {}
        }
        return res.status(400).json({
          success: false,
          error: 'This PDF appears to be scanned. Please upload a text-based PDF.',
          message: 'This PDF appears to be scanned. Please upload a text-based PDF.'
        });
      }

      // If AI service is offline
      if (aiError.code === 'ECONNREFUSED' || !aiError.response) {
        return res.status(503).json({
          success: false,
          isAiServiceOffline: true,
          error: 'Server unavailable. Python AI microservice is currently unreachable.',
          message: 'Server unavailable. Python AI microservice is currently unreachable.'
        });
      }

      return res.status(500).json({
        success: false,
        error: aiError.response?.data?.detail || aiError.message || 'Failed to process resume document.',
        message: aiError.response?.data?.detail || aiError.message || 'Failed to process resume document.'
      });
    }

    // Step 4: Delete the temporary file from the uploads directory to prevent storage bloat
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupErr) {
        console.warn('[Resume Controller] Could not delete temporary upload file:', cleanupErr.message);
      }
    }

    // Step 5: Compute dynamic Shortlist Score (ATS)
    const shortlistScore = computeShortlistScore(skillsArray);

    // Step 6: Save Resume in SQLite via Prisma
    const savedResume = await prisma.resume.create({
      data: {
        userId,
        fileName: originalname,
        fileUrl,
        extractedText: cleanedText,
        skillsArray: serializeSkills(skillsArray),
        shortlistScore: parseFloat(shortlistScore)
      }
    });

    // Step 4: Update User resumeSkills, Profile Strength, and sync Placement Readiness Score
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (currentUser) {
      const newStrength = calculateProfileStrength({
        ...currentUser,
        resumeSkills: serializeSkills(skillsArray)
      }, true);

      await prisma.user.update({
        where: { id: userId },
        data: {
          resumeSkills: serializeSkills(skillsArray),
          profileStrength: newStrength
        }
      });

      // Recalculate Placement Readiness Score in DB
      try {
        await ReadinessService.calculateReadiness(userId);
      } catch (readinessErr) {
        console.warn('[Resume Controller] Readiness calculation sync warning:', readinessErr.message);
      }
    }

    const parsedResume = {
      ...savedResume,
      skillsArray: parseSkills(savedResume.skillsArray)
    };

    return res.status(201).json({
      success: true,
      message: 'Resume Uploaded!',
      resume: parsedResume,
      skills: skillsArray,
      shortlistScore: shortlistScore,
      aiEngineUsed: 'pdf-parse + FastAPI-NLP'
    });
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
    console.error('[Resume Controller] Upload Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during upload.',
      message: 'Server error during upload.'
    });
  }
};

/**
 * Fetch all resumes belonging to user
 * Route: GET /api/resume
 */
export const getUserResumes = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const parsed = resumes.map(r => ({
      ...r,
      skillsArray: parseSkills(r.skillsArray)
    }));

    return res.status(200).json({
      success: true,
      resumes: parsed
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fetch single resume by ID
 * Route: GET /api/resume/:id
 */
export const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await prisma.resume.findUnique({
      where: { id }
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    return res.status(200).json({
      success: true,
      resume: {
        ...resume,
        skillsArray: parseSkills(resume.skillsArray)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Server-Side PDF Rendering: Export 1-Page ATS-Compliant Resume using PDFKit
 * Route: GET /api/resume/export
 */
export const exportAtsResume = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: true,
        skills: true,
        resumes: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const latestResume = user.resumes?.[0] || null;
    const pdfBuffer = await ResumePdfService.generateAtsResume(user, latestResume);

    const safeName = (user.name || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${safeName}_ATS_Resume.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (error) {
    console.error('[Resume Controller] Export PDF Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate ATS resume PDF: ' + error.message
    });
  }
};
