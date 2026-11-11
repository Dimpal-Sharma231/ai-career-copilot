import axios from 'axios';
import prisma from '../config/prisma.js';
import { ReadinessService } from '../services/readiness.service.js';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

const CURATED_QUESTIONS = [
  "Tell me about a challenging project or technical obstacle you encountered, and walk me through how you diagnosed and resolved it.",
  "Describe a scenario where you had to optimize API latency or handle high concurrency. What trade-offs did you consider?",
  "Can you discuss a situation where you worked in a team under a tight deadline and had differing technical opinions with a peer?",
  "Walk me through your design philosophy when structuring a scalable database schema with indexing and caching.",
  "Tell me about a time when a production deployment failed or an edge-case bug escaped to testing. How did you react?"
];

/**
 * Start a new Stateful Mock Interview Session
 * Route: POST /api/interview/start
 */
export const startInterviewSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { role = 'Software Development Engineer (SDE)', company = 'Tier-1 Campus Placement' } = req.body;

    // Pick opening question
    const firstQuestion = CURATED_QUESTIONS[0];

    const session = await prisma.mockInterview.create({
      data: {
        userId,
        role,
        company,
        status: 'in_progress',
        averageScore: 0,
        feedbackSummary: 'Interview initiated. Answer using the STAR method for maximum score.',
        messages: {
          create: [
            {
              sender: 'ai',
              content: firstQuestion
            }
          ]
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return res.status(201).json({
      success: true,
      session,
      openingQuestion: firstQuestion
    });
  } catch (error) {
    console.error('[Interview Controller] Start Session Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate interview session: ' + error.message
    });
  }
};

/**
 * Submit an answer in the Stateful Interview
 * Route: POST /api/interview/answer
 */
export const submitAnswer = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { interviewId, answer, question } = req.body;

    if (!interviewId || !answer) {
      return res.status(400).json({
        success: false,
        message: 'interviewId and answer are required.'
      });
    }

    const session = await prisma.mockInterview.findFirst({
      where: { id: interviewId, userId },
      include: { messages: true }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    // Step 1: Forward answer to Python FastAPI NLP Engine (/api/interview/evaluate)
    let evaluation = null;
    try {
      console.log(`[Interview Controller] Disagreeing answer to Python NLP microservice: ${PYTHON_SERVICE_URL}/api/interview/evaluate`);
      const aiRes = await axios.post(`${PYTHON_SERVICE_URL}/api/interview/evaluate`, {
        question: question || 'Technical interview question',
        answer,
        role: session.role || 'sde'
      }, {
        timeout: 10000
      });

      if (aiRes.data) {
        evaluation = aiRes.data;
      }
    } catch (aiErr) {
      console.warn('[Interview Controller] Python AI microservice offline, using heuristic fallback:', aiErr.message);

      // Local fallback heuristic for STAR detection
      const lower = answer.toLowerCase();
      const hasS = /when|during|in my project|we were|faced/.test(lower);
      const hasT = /task|responsibility|needed to|had to|goal/.test(lower);
      const hasA = /implemented|designed|built|developed|optimized|analyzed/.test(lower);
      const hasR = /result|outcome|achieved|improved|reduced|boosted/.test(lower);

      const starCount = [hasS, hasT, hasA, hasR].filter(Boolean).length;
      const wordCount = answer.trim().split(/\s+/).length;
      const score = Math.min(9.8, Math.max(4.0, 4.0 + (starCount * 1.2) + (wordCount >= 50 ? 1.0 : 0)));

      evaluation = {
        score: parseFloat(score.toFixed(1)),
        feedback: starCount === 4
          ? "Great structure applying Situation, Task, Action, and Result effectively."
          : `Good technical content, but missing the ${!hasR ? "'Result'" : !hasA ? "'Action'" : "'Situation'"} aspect. Be sure to quantify metrics.`,
        starAnalysis: {
          situation: hasS,
          task: hasT,
          action: hasA,
          result: hasR
        },
        wordCount,
        confidenceLevel: wordCount > 60 ? "High" : "Moderate",
        idealAnswerKeywords: ["scalability", "latency", "redis", "testing", "impact"],
        sentimentPolarity: 0.2
      };
    }

    // Step 2: Save student answer to SQLite messages
    const userMessage = await prisma.mockInterviewMessage.create({
      data: {
        interviewId,
        sender: 'user',
        content: answer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        starAnalysis: JSON.stringify(evaluation.starAnalysis || {}),
        idealKeywords: JSON.stringify(evaluation.idealAnswerKeywords || [])
      }
    });

    // Step 3: Determine next question or conclude
    const answeredCount = session.messages.filter(m => m.sender === 'user').length + 1;
    let nextQuestion = null;
    let sessionStatus = session.status;

    if (answeredCount < CURATED_QUESTIONS.length) {
      nextQuestion = CURATED_QUESTIONS[answeredCount];
      await prisma.mockInterviewMessage.create({
        data: {
          interviewId,
          sender: 'ai',
          content: nextQuestion
        }
      });
    } else {
      sessionStatus = 'completed';
      nextQuestion = "You have completed all interview questions for this session! Review your Coach Feedback Cards below.";
      await prisma.mockInterviewMessage.create({
        data: {
          interviewId,
          sender: 'ai',
          content: nextQuestion
        }
      });
    }

    // Step 4: Recalculate average interview session score
    const allUserMessages = await prisma.mockInterviewMessage.findMany({
      where: { interviewId, sender: 'user' }
    });

    const avgScore = allUserMessages.length > 0
      ? (allUserMessages.reduce((sum, m) => sum + (m.score || 7.0), 0) / allUserMessages.length)
      : evaluation.score;

    const updatedSession = await prisma.mockInterview.update({
      where: { id: interviewId },
      data: {
        averageScore: parseFloat(avgScore.toFixed(1)),
        status: sessionStatus,
        feedbackSummary: `Completed ${answeredCount} responses with average STAR rating of ${avgScore.toFixed(1)}/10.`
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Step 5: Recalculate & persist User's Placement Readiness Score in SQLite
    let updatedReadiness = null;
    try {
      updatedReadiness = await ReadinessService.calculateReadiness(userId);
    } catch (readinessErr) {
      console.warn('[Interview Controller] Could not recalculate readiness:', readinessErr.message);
    }

    return res.status(200).json({
      success: true,
      evaluation,
      userMessage,
      nextQuestion,
      session: updatedSession,
      readiness: updatedReadiness
    });
  } catch (error) {
    console.error('[Interview Controller] Submit Answer Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process interview response: ' + error.message
    });
  }
};

/**
 * Get all past mock interviews for user
 * Route: GET /api/interview/history
 */
export const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const sessions = await prisma.mockInterview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single interview session with full chat history & coach cards
 * Route: GET /api/interview/:id
 */
export const getSessionById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const session = await prisma.mockInterview.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    return res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
