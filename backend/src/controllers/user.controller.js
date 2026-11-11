import prisma from '../config/prisma.js';

/**
 * Dynamically calculate profile completeness strength:
 * - Base profile created: 20%
 * - College Name specified: +15%
 * - Target Role specified: +15%
 * - LeetCode Profile link added: +20%
 * - GitHub Link added: +15%
 * - Primary Resume uploaded: +15%
 * Total capped at 100%
 */
export const calculateProfileStrength = (user, hasResume = false) => {
  let score = 20; // Base score for registration
  if (user.college && user.college.trim()) score += 15;
  if (user.targetRole && user.targetRole.trim()) score += 15;
  if (user.leetcodeUrl && user.leetcodeUrl.trim()) score += 20;
  if (user.githubUrl && user.githubUrl.trim()) score += 15;
  if (hasResume || (user.resumeSkills && user.resumeSkills !== '[]')) score += 15;
  return Math.min(100, score);
};

/**
 * GET /api/users/profile
 * Returns the current authenticated user's profile with calculated strength
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            resumes: true,
            applications: true,
            matchHistories: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    const hasResume = user._count.resumes > 0;
    const strength = calculateProfileStrength(user, hasResume);

    // If strength in DB differs, synchronize it
    if (user.profileStrength !== strength) {
      await prisma.user.update({
        where: { id: userId },
        data: { profileStrength: strength }
      });
      user.profileStrength = strength;
    }

    const { password, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    console.error('[User Controller] Get Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile: ' + error.message
    });
  }
};

/**
 * PATCH /api/users/profile
 * Securely updates student profile fields and recalculates completeness strength
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      college,
      graduationYear,
      gradYear, // Support fallback
      targetRole,
      targetCompanies,
      leetcodeUrl,
      leetcodeUsername, // Support fallback
      githubUrl
    } = req.body;

    const resolvedGraduationYear = graduationYear !== undefined ? graduationYear : gradYear;
    const resolvedLeetcodeUrl = leetcodeUrl !== undefined ? leetcodeUrl : leetcodeUsername;

    // Check existing resume count for strength calculation
    const resumeCount = await prisma.resume.count({ where: { userId } });
    const hasResume = resumeCount > 0;

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const candidateUser = {
      ...existingUser,
      college: college !== undefined ? college : existingUser.college,
      targetRole: targetRole !== undefined ? targetRole : existingUser.targetRole,
      leetcodeUrl: resolvedLeetcodeUrl !== undefined ? resolvedLeetcodeUrl : existingUser.leetcodeUrl,
      githubUrl: githubUrl !== undefined ? githubUrl : existingUser.githubUrl,
    };

    const newStrength = calculateProfileStrength(candidateUser, hasResume);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(college !== undefined && { college }),
        ...(resolvedGraduationYear !== undefined && { graduationYear: resolvedGraduationYear }),
        ...(targetRole !== undefined && { targetRole }),
        ...(targetCompanies !== undefined && { targetCompanies }),
        ...(resolvedLeetcodeUrl !== undefined && { leetcodeUrl: resolvedLeetcodeUrl }),
        ...(githubUrl !== undefined && { githubUrl }),
        profileStrength: newStrength
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
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (error) {
    console.error('[User Controller] Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile: ' + error.message
    });
  }
};

/**
 * PATCH /api/users/dsa
 * Updates student DSA prep metrics (Streak, Problems Solved, Striver Sheet target)
 */
export const updateUserDsa = async (req, res) => {
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
      message: 'DSA stats updated successfully!',
      user: updatedUser
    });
  } catch (error) {
    console.error('[User Controller] Update DSA Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update DSA stats: ' + error.message
    });
  }
};
