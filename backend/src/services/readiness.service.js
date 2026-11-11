import prisma from '../config/prisma.js';

/**
 * Service layer to aggregate placement readiness across 4 distinct Prisma models:
 * 1. Resume (Shortlist ATS score)
 * 2. DSAStats (Coding streak, questions solved vs target)
 * 3. UserProfile / User (Profile completeness strength)
 * 4. MockInterview (Average score across completed AI mock interviews)
 * 
 * Formula: (Resume * 0.3) + (DSA * 0.3) + (Profile * 0.2) + (Interview * 0.2)
 */
export class ReadinessService {
  static async calculateReadiness(userId) {
    // 1. Fetch User Profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        dsaStats: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 2. Fetch Latest / Average Resume Shortlist Score
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    let resumeScore = 0;
    if (resumes.length > 0) {
      const totalScore = resumes.reduce((acc, r) => acc + (r.shortlistScore || 80), 0);
      resumeScore = Math.round(totalScore / resumes.length);
    }

    // 3. Calculate DSA Progress Score (0 - 100)
    // Priority: dsaStats relation -> fallback to user inline fields
    const dsaRecord = user.dsaStats || {
      streak: user.dsaStreak || 0,
      solved: user.dsaSolved || 0,
      totalTarget: user.dsaTarget || 191,
      striverSolved: user.striverSolved || 0
    };

    const targetCount = Math.max(dsaRecord.totalTarget || 191, 1);
    const solvedCount = dsaRecord.solved || dsaRecord.striverSolved || 0;
    const rawDsaRatio = (solvedCount / targetCount) * 100;
    const streakBonus = Math.min(15, (dsaRecord.streak || 0) * 0.5); // Up to 15 bonus points for streak consistency
    const dsaScore = Math.min(100, Math.round(rawDsaRatio * 0.85 + streakBonus));

    // 4. Fetch User Profile Completeness (0 - 100)
    const profileScore = Math.min(100, Math.max(0, user.profileStrength || 20));

    // 5. Fetch Completed Mock Interviews & Compute Average Score (0 - 100)
    const mockInterviews = await prisma.mockInterview.findMany({
      where: {
        userId,
        status: 'completed'
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    let interviewScore = 0;
    if (mockInterviews.length > 0) {
      const totalInterviewScore = mockInterviews.reduce((acc, m) => {
        // Average score can be 0-10 or 0-100; normalize to 100
        const normalized = m.averageScore <= 10 ? m.averageScore * 10 : m.averageScore;
        return acc + normalized;
      }, 0);
      interviewScore = Math.min(100, Math.round(totalInterviewScore / mockInterviews.length));
    }

    // Weighted Formula:
    // (Resume * 0.3) + (DSA * 0.3) + (Profile * 0.2) + (Interview * 0.2)
    const weightedResume = resumeScore * 0.3;
    const weightedDsa = dsaScore * 0.3;
    const weightedProfile = profileScore * 0.2;
    const weightedInterview = interviewScore * 0.2;

    const overallScore = Math.min(100, Math.max(0, Math.round(
      weightedResume + weightedDsa + weightedProfile + weightedInterview
    )));

    // Persist updated composite readiness score directly to User model in database
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { readinessScore: overallScore }
      });
    } catch (dbErr) {
      console.warn('[Readiness Service] Could not persist user.readinessScore:', dbErr.message);
    }

    // Categorization & Tier Label
    let tier = 'Needs Acceleration';
    let tierColor = 'rose';
    let summaryMessage = 'Get started with initial placements prep.';

    if (overallScore >= 75) {
      tier = 'Super Dream / Day-1 Ready';
      tierColor = 'emerald';
      summaryMessage = 'High probability of clearing Tier-1 OA and Technical Rounds (₹18-35 LPA).';
    } else if (overallScore >= 50) {
      tier = 'Placement Ready';
      tierColor = 'saffron';
      summaryMessage = 'Solid foundation. Focus on mock interviews and bridging missing skills.';
    } else {
      tier = 'Needs Acceleration';
      tierColor = 'rose';
      summaryMessage = 'Upload your technical resume and complete your first mock interview to boost rank.';
    }

    // Actionable Recommendations based on lowest metrics
    const recommendations = [];
    if (resumeScore < 60) {
      recommendations.push({
        area: 'Resume Shortlist',
        tip: 'Upload a tailored PDF resume with quantifiable impact metrics to unlock +30 points.'
      });
    }
    if (dsaScore < 50) {
      recommendations.push({
        area: 'DSA Preparation',
        tip: 'Target solving 3-5 problems/week on Striver SDE sheet and maintain coding streak.'
      });
    }
    if (interviewScore < 50) {
      recommendations.push({
        area: 'Mock Interview',
        tip: 'Take an AI STAR-method mock interview to practice behavioral and technical articulation.'
      });
    }
    if (profileScore < 70) {
      recommendations.push({
        area: 'Profile Credentials',
        tip: 'Add your LeetCode profile handle and GitHub repository links in Settings.'
      });
    }

    return {
      overallScore,
      overallReadinessScore: overallScore,
      tier,
      readinessTier: tier,
      tierColor,
      summaryMessage,
      breakdown: {
        resume: {
          label: 'Resume Shortlist Score',
          score: resumeScore,
          weight: '30%',
          contribution: parseFloat(weightedResume.toFixed(1)),
          weightedScore: parseFloat(weightedResume.toFixed(1)),
          details: resumes.length > 0 ? `${resumes.length} resume(s) analyzed` : 'No resume uploaded yet',
          status: resumes.length > 0 ? `${resumes.length} resume(s)` : 'No resume',
          count: resumes.length
        },
        dsa: {
          label: 'DSA Preparation Metric',
          score: dsaScore,
          weight: '30%',
          contribution: parseFloat(weightedDsa.toFixed(1)),
          weightedScore: parseFloat(weightedDsa.toFixed(1)),
          details: `${solvedCount}/${targetCount} solved • ${dsaRecord.streak || 0}d streak`,
          status: `${solvedCount} solved`,
          streak: dsaRecord.streak,
          solved: solvedCount,
          target: targetCount
        },
        profile: {
          label: 'Profile Completeness',
          score: profileScore,
          weight: '20%',
          contribution: parseFloat(weightedProfile.toFixed(1)),
          weightedScore: parseFloat(weightedProfile.toFixed(1)),
          details: `${profileScore}% profile completeness`,
          status: `${profileScore}% complete`
        },
        mockInterview: {
          label: 'Mock Interview Average',
          score: interviewScore,
          weight: '20%',
          contribution: parseFloat(weightedInterview.toFixed(1)),
          weightedScore: parseFloat(weightedInterview.toFixed(1)),
          details: mockInterviews.length > 0 ? `${mockInterviews.length} session(s) completed` : 'No session completed yet',
          status: mockInterviews.length > 0 ? `${mockInterviews.length} completed` : 'Not started',
          completedSessions: mockInterviews.length
        }
      },
      recommendations
    };
  }
}
