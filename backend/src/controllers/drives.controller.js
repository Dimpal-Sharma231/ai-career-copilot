import prisma from '../config/prisma.js';

// Realistic upcoming Indian campus placement drives seed
const SEED_DRIVES = [
  {
    companyName: 'Zomato',
    role: 'SDE-1 (Platform & High-Throughput Orders)',
    daysOffset: 2, // Urgent: 2 days left
    applicationLink: 'https://www.zomato.com/careers',
    status: 'Urgent',
    salary: '₹22 - 28 LPA',
    location: 'Gurugram / Hybrid',
    eligibility: 'B.Tech CSE/IT/ECE (>= 7.5 CGPA)',
    tier: 'Super Dream'
  },
  {
    companyName: 'Razorpay',
    role: 'Software Development Engineer — Payments UI',
    daysOffset: 3, // Urgent: 3 days left
    applicationLink: 'https://razorpay.com/jobs',
    status: 'Urgent',
    salary: '₹20 - 24 LPA',
    location: 'Bangalore',
    eligibility: 'B.Tech / MCA (>= 7.0 CGPA)',
    tier: 'Super Dream'
  },
  {
    companyName: 'Flipkart',
    role: 'SDE-1 (Off-Campus Placement Drive)',
    daysOffset: 5,
    applicationLink: 'https://www.flipkartcareers.com',
    status: 'Open',
    salary: '₹26 - 32 LPA',
    location: 'Bangalore',
    eligibility: '2026 Batch Graduates',
    tier: 'Super Dream'
  },
  {
    companyName: 'CRED',
    role: 'Backend Engineering Intern / PPO',
    daysOffset: 7,
    applicationLink: 'https://careers.cred.club',
    status: 'Open',
    salary: '₹90,000/mo + ₹30 LPA PPO',
    location: 'Bangalore',
    eligibility: 'Strong DSA & Go/Java proficiency',
    tier: 'Super Dream'
  },
  {
    companyName: 'Swiggy',
    role: 'Associate Software Engineer (Core Logistics)',
    daysOffset: 9,
    applicationLink: 'https://careers.swiggy.com',
    status: 'Open',
    salary: '₹18 - 22 LPA',
    location: 'Bangalore / Remote',
    eligibility: 'B.Tech CSE/IT',
    tier: 'Dream'
  },
  {
    companyName: 'TCS Digital',
    role: 'Systems Engineer — Cloud & AI Practice',
    daysOffset: 14,
    applicationLink: 'https://nextstep.tcs.com',
    status: 'Open',
    salary: '₹7.5 - 9.0 LPA',
    location: 'Pan India (Pune / Mumbai / Chennai)',
    eligibility: 'All Engineering Streams (>= 60%)',
    tier: 'Day-1 Digital'
  }
];

/**
 * Seed initial placement drives if database table is empty
 */
async function ensureDrivesSeeded() {
  const count = await prisma.placementDrive.count();
  if (count === 0) {
    const now = new Date();
    for (const d of SEED_DRIVES) {
      const deadline = new Date(now.getTime() + d.daysOffset * 24 * 60 * 60 * 1000);
      deadline.setHours(23, 59, 59, 999);

      await prisma.placementDrive.create({
        data: {
          companyName: d.companyName,
          role: d.role,
          deadline,
          applicationLink: d.applicationLink,
          status: d.status,
          salary: d.salary,
          location: d.location,
          eligibility: d.eligibility,
          tier: d.tier
        }
      });
    }
  }
}

/**
 * Fetch upcoming placement drives with time-series daysLeft calculation
 * Route: GET /api/drives
 */
export const getUpcomingDrives = async (req, res) => {
  try {
    await ensureDrivesSeeded();

    const drives = await prisma.placementDrive.findMany({
      orderBy: { deadline: 'asc' }
    });

    const now = new Date();

    const enrichedDrives = drives.map(drive => {
      const deadlineDate = new Date(drive.deadline);
      const diffMs = deadlineDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));

      let urgencyStatus = drive.status;
      if (daysLeft <= 0) {
        urgencyStatus = 'Closed';
      } else if (daysLeft <= 3) {
        urgencyStatus = 'Urgent';
      } else if (daysLeft <= 7) {
        urgencyStatus = 'Closing Soon';
      } else {
        urgencyStatus = 'Open';
      }

      return {
        ...drive,
        company: drive.companyName || drive.company || 'Tech Company',
        companyName: drive.companyName || drive.company || 'Tech Company',
        ctc: drive.salary || drive.ctc || 'Competitive CTC',
        salary: drive.salary || drive.ctc || 'Competitive CTC',
        portalUrl: drive.applicationLink || drive.portalUrl || '#',
        applicationLink: drive.applicationLink || drive.portalUrl || '#',
        eligibleBranches: drive.eligibility || drive.eligibleBranches || 'All B.Tech/B.E.',
        eligibility: drive.eligibility || drive.eligibleBranches || 'All B.Tech/B.E.',
        daysLeft,
        hoursLeft,
        isUrgent: daysLeft > 0 && daysLeft <= 3,
        isExpired: daysLeft <= 0,
        computedStatus: urgencyStatus,
        deadlineFormatted: deadlineDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedDrives.length,
      urgentCount: enrichedDrives.filter(d => d.isUrgent).length,
      drives: enrichedDrives
    });
  } catch (error) {
    console.error('[Drives Controller] Get Drives Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch placement drives: ' + error.message
    });
  }
};

/**
 * Create a custom campus drive
 * Route: POST /api/drives
 */
export const createDrive = async (req, res) => {
  try {
    const { companyName, role, deadline, applicationLink, salary, location, eligibility, tier } = req.body;

    if (!companyName || !role || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'companyName, role, and deadline are required.'
      });
    }

    const drive = await prisma.placementDrive.create({
      data: {
        companyName,
        role,
        deadline: new Date(deadline),
        applicationLink: applicationLink || '',
        salary: salary || '',
        location: location || 'Hybrid',
        eligibility: eligibility || 'CSE / IT / ECE',
        tier: tier || 'Dream'
      }
    });

    return res.status(201).json({
      success: true,
      drive
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
