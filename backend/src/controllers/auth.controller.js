import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_career_copilot_jwt_key_2026_venture_backed';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Calculate Profile Strength based on completed fields
const calculateProfileStrength = (user, hasResume = false) => {
  let score = 20; // Base score for registration
  if (user.college && user.college.trim()) score += 15;
  if (user.targetRole && user.targetRole.trim()) score += 15;
  if (user.leetcodeUrl && user.leetcodeUrl.trim()) score += 20;
  if (user.githubUrl && user.githubUrl.trim()) score += 15;
  if (hasResume || (user.resumeSkills && user.resumeSkills !== '[]')) score += 15;
  return Math.min(100, score);
};

/**
 * Register a new engineering student user
 * Route: POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if user already exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists. Please log in.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new student user with empty initial placement data
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        avatarUrl: '',
        provider: 'local',
        college: '',
        graduationYear: '2026',
        targetRole: 'Software Development Engineer (SDE)',
        targetCompanies: 'Zomato, Swiggy, Razorpay, Flipkart',
        leetcodeUrl: '',
        githubUrl: '',
        resumeSkills: '[]',
        dsaStreak: 0,
        dsaSolved: 0,
        dsaTarget: 191,
        striverSolved: 0,
        onboardingCompleted: false,
        profileStrength: 20
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        provider: true,
        college: true,
        graduationYear: true,
        targetRole: true,
        targetCompanies: true,
        leetcodeUrl: true,
        githubUrl: true,
        resumeSkills: true,
        dsaStreak: true,
        dsaSolved: true,
        dsaTarget: true,
        striverSolved: true,
        profileStrength: true,
        onboardingCompleted: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please complete your onboarding.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration: ' + error.message
    });
  }
};

/**
 * Log in an existing user
 * Route: POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        _count: {
          select: { resumes: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check if account was created exclusively with Google OAuth
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was created with Google Sign-In. Please click "Continue with Google".'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const hasResume = (user._count?.resumes || 0) > 0;
    const computedStrength = calculateProfileStrength(user, hasResume);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
        provider: user.provider || 'local',
        college: user.college,
        graduationYear: user.graduationYear,
        targetRole: user.targetRole,
        targetCompanies: user.targetCompanies,
        leetcodeUrl: user.leetcodeUrl,
        githubUrl: user.githubUrl,
        resumeSkills: user.resumeSkills,
        dsaStreak: user.dsaStreak,
        dsaSolved: user.dsaSolved,
        dsaTarget: user.dsaTarget,
        striverSolved: user.striverSolved,
        profileStrength: computedStrength,
        onboardingCompleted: user.onboardingCompleted,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database/Server error during login: ' + error.message
    });
  }
};

/**
 * Sign in or Sign up via Google OAuth
 * Route: POST /api/auth/google
 */
export const googleAuth = async (req, res) => {
  try {
    const { email, name, avatarUrl } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication requires a verified email address.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const displayName = (name && name.trim()) || normalizedEmail.split('@')[0];

    // Find existing user by email
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        _count: {
          select: { resumes: true }
        }
      }
    });

    if (!user) {
      // Create new student user with Google profile info
      user = await prisma.user.create({
        data: {
          name: displayName,
          email: normalizedEmail,
          password: null, // OAuth account
          avatarUrl: avatarUrl || '',
          provider: 'google',
          college: '',
          graduationYear: '2026',
          targetRole: 'Software Development Engineer (SDE)',
          targetCompanies: 'Zomato, Swiggy, Razorpay, Flipkart',
          leetcodeUrl: '',
          githubUrl: '',
          resumeSkills: '[]',
          dsaStreak: 0,
          dsaSolved: 0,
          dsaTarget: 191,
          striverSolved: 0,
          onboardingCompleted: false,
          profileStrength: 20
        },
        include: {
          _count: {
            select: { resumes: true }
          }
        }
      });
    } else {
      // Update avatar / provider if missing
      const shouldUpdate = (!user.avatarUrl && avatarUrl) || (user.provider !== 'google' && !user.provider);
      if (shouldUpdate) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            ...(avatarUrl && { avatarUrl }),
            provider: user.provider || 'google'
          },
          include: {
            _count: {
              select: { resumes: true }
            }
          }
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const hasResume = (user._count?.resumes || 0) > 0;
    const computedStrength = calculateProfileStrength(user, hasResume);

    return res.status(200).json({
      success: true,
      message: 'Google Sign-In successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || avatarUrl || '',
        provider: user.provider || 'google',
        college: user.college,
        graduationYear: user.graduationYear,
        targetRole: user.targetRole,
        targetCompanies: user.targetCompanies,
        leetcodeUrl: user.leetcodeUrl,
        githubUrl: user.githubUrl,
        resumeSkills: user.resumeSkills,
        dsaStreak: user.dsaStreak,
        dsaSolved: user.dsaSolved,
        dsaTarget: user.dsaTarget,
        striverSolved: user.striverSolved,
        profileStrength: computedStrength,
        onboardingCompleted: user.onboardingCompleted,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during Google Sign-In: ' + error.message
    });
  }
};

/**
 * Get current authenticated user profile
 * Route: GET /api/auth/me
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { resumes: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const hasResume = user._count?.resumes > 0;
    const strength = calculateProfileStrength(user, hasResume);

    const { password, _count, ...safeUser } = user;
    safeUser.profileStrength = strength;

    return res.status(200).json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit Onboarding Profile
 * Route: PUT /api/auth/onboarding
 */
export const updateOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      college,
      graduationYear,
      gradYear,
      targetRole,
      targetCompanies,
      leetcodeUrl,
      leetcodeUsername,
      githubUrl,
      dsaSolved = 0,
      dsaStreak = 0
    } = req.body;

    const resolvedGraduationYear = graduationYear !== undefined ? graduationYear : (gradYear || '2026');
    const resolvedLeetcodeUrl = leetcodeUrl !== undefined ? leetcodeUrl : (leetcodeUsername || '');

    const strength = calculateProfileStrength({
      college: college || '',
      targetRole: targetRole || '',
      leetcodeUrl: resolvedLeetcodeUrl,
      githubUrl: githubUrl || '',
    }, false);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        college: college || '',
        graduationYear: resolvedGraduationYear,
        targetRole: targetRole || 'Software Development Engineer (SDE)',
        targetCompanies: targetCompanies || 'Zomato, Swiggy, Razorpay, Flipkart',
        leetcodeUrl: resolvedLeetcodeUrl,
        githubUrl: githubUrl || '',
        dsaSolved: Number(dsaSolved) || 0,
        dsaStreak: Number(dsaStreak) || 0,
        profileStrength: strength,
        onboardingCompleted: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        college: true,
        graduationYear: true,
        targetRole: true,
        targetCompanies: true,
        leetcodeUrl: true,
        githubUrl: true,
        resumeSkills: true,
        dsaStreak: true,
        dsaSolved: true,
        dsaTarget: true,
        striverSolved: true,
        profileStrength: true,
        onboardingCompleted: true,
        createdAt: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully!',
      user: updatedUser
    });
  } catch (error) {
    console.error('Onboarding Update Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update onboarding profile: ' + error.message
    });
  }
};

/**
 * Update DSA Stats
 * Route: PUT /api/auth/dsa
 */
export const updateDsaStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dsaStreak, dsaSolved, striverSolved, dsaTarget } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(dsaStreak !== undefined && { dsaStreak: Number(dsaStreak) }),
        ...(dsaSolved !== undefined && { dsaSolved: Number(dsaSolved) }),
        ...(striverSolved !== undefined && { striverSolved: Number(striverSolved) }),
        ...(dsaTarget !== undefined && { dsaTarget: Number(dsaTarget) })
      },
      select: {
        id: true,
        name: true,
        email: true,
        college: true,
        graduationYear: true,
        targetRole: true,
        targetCompanies: true,
        leetcodeUrl: true,
        githubUrl: true,
        resumeSkills: true,
        dsaStreak: true,
        dsaSolved: true,
        dsaTarget: true,
        striverSolved: true,
        profileStrength: true,
        onboardingCompleted: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'DSA stats updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
