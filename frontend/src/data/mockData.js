export const MOCK_USER = {
  id: 'usr_in_77a921',
  name: 'Rahul Sharma',
  email: 'rahul.sharma2022@vitstudent.ac.in',
  role: 'B.Tech CSE • SDE Aspirant',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
  university: 'VIT Vellore, Batch of 2026',
  prepCoins: 840,
  maxPrepCoins: 1000,
  cgpa: '9.12 / 10.0'
};

export const MOCK_DSA_STATS = {
  streakDays: 45,
  totalSolved: 340,
  easy: 120,
  medium: 180,
  hard: 40,
  striverSheetProgress: 82, // 82% of SDE Sheet complete
  leetCodeRating: 1845,     // LeetCode Knight badge
  gfgRank: 'Top 5% in College'
};

export const MOCK_DASHBOARD_STATS = {
  totalResumesAnalyzed: 4,
  activeApplications: 12,
  averageJobFit: 84,
  interviewInvites: 5,
  resumesTrend: '+2 this week',
  applicationsTrend: '+4 on-campus drives',
  jobFitTrend: '+8% vs previous version',
  interviewTrend: '2 interviews scheduled this week'
};

export const MOCK_DEFAULT_RESUME = {
  id: 'res_in_98a72b',
  fileName: 'Rahul_Sharma_BTech_CSE_Resume.pdf',
  uploadedAt: 'Nov 9, 2026 • 11:30 AM',
  fileSize: '148 KB',
  shortlistScore: 94, // Resume Shortlist Score
  summary: 'Final year B.Tech Computer Science student at VIT Vellore. Smart India Hackathon (SIH) finalist and active competitive programmer (LeetCode 1845 rating). Hands-on experience engineering scalable REST microservices, low-latency React client states, and optimizing PostgreSQL database queries under high concurrency.',
  skills: {
    languages: ['C++', 'Java', 'Python', 'TypeScript', 'JavaScript', 'SQL', 'Go'],
    frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'Tailwind CSS', 'Redux Toolkit'],
    cloudDevops: ['Docker', 'AWS (EC2, S3)', 'PostgreSQL', 'Redis', 'Git', 'Linux', 'CI/CD Pipelines'],
    aiData: ['scikit-learn', 'PyTorch', 'Pandas', 'NumPy', 'TF-IDF', 'Vector Databases'],
    architecture: ['Data Structures & Algorithms', 'System Design', 'RESTful APIs', 'Microservices', 'OOP']
  },
  experienceHighlights: [
    {
      company: 'Zomato',
      role: 'SDE Intern — Delivery Infrastructure',
      period: 'May 2025 - July 2025',
      bullets: [
        'Built real-time order tracking WebSocket notification pipelines in Node.js & Redis, reducing notification delivery latency by 38%.',
        'Optimized PostgreSQL index schemas for active delivery partner geolocation queries, handling 15k+ QPS.'
      ]
    },
    {
      company: 'Smart India Hackathon (SIH)',
      role: 'Team Lead & Backend Architect',
      period: 'Aug 2024 - Dec 2024',
      bullets: [
        'Selected as National Finalist for developing an AI-driven automated grievance categorization portal using FastAPI and PyPDF2.'
      ]
    }
  ],
  education: {
    institution: 'Vellore Institute of Technology (VIT), Vellore',
    degree: 'B.Tech in Computer Science and Engineering',
    gpa: '9.12 / 10.0 CGPA',
    gradDate: 'June 2026'
  },
  aiRecommendations: [
    'Quantify the QPS impact and throughput scale for your Zomato internship bullet points to target Tier 1 SDE-1 roles.',
    'Explicitly list your LeetCode 1845 rating and 340+ DSA problems solved at the top of your technical profile.',
    'Highlight experience with PostgreSQL indexing and caching for high-volume Indian fintech platforms like Razorpay and CRED.'
  ]
};

export const SAMPLE_JOB_DESCRIPTIONS = [
  {
    id: 'zomato_sde1',
    title: 'SDE-1 (Backend / Platform Engineering)',
    company: 'Zomato',
    location: 'Gurgaon, Haryana / Hybrid',
    salary: '₹22 - ₹28 LPA + ESOPs',
    description: `About the Role:
Zomato is India's leading food delivery and quick commerce network. As an SDE-1 on our Platform Infrastructure team, you will build hyper-scale services supporting millions of transactions during peak dinner and festive rush hours.

Key Requirements:
• Strong grasp of Data Structures and Algorithms (DSA) and Object-Oriented Programming (OOP).
• Proficiency in C++, Java, Go, or Python with experience building high-throughput RESTful microservices.
• Solid fundamentals in PostgreSQL, Redis caching, message brokers (Kafka/RabbitMQ), and database indexing.
• Familiarity with Docker containerization, Linux shell environments, and AWS cloud services.
• Ability to write clean, modular, and testable code with unit tests (Jest, PyTest, or JUnit).`
  },
  {
    id: 'razorpay_frontend',
    title: 'Software Development Engineer — Payments UI',
    company: 'Razorpay',
    location: 'Bangalore, Karnataka',
    salary: '₹24 - ₹30 LPA + Stock Grants',
    description: `About the Team:
Razorpay powers digital payments for millions of businesses across India. As a Frontend SDE on the Core Checkout team, you will build accessible, mission-critical checkout flows that process UPI, Cards, and NetBanking transactions with 99.99% availability.

Requirements:
• Exceptional proficiency in React, TypeScript, JavaScript (ES6+), and modern styling (Tailwind CSS).
• Deep understanding of Web Performance optimization (Core Web Vitals, bundle reduction) for diverse Indian network tiers (2G/3G/4G).
• Experience integrating RESTful APIs and WebSocket state synchronization.
• Strong attention to UX micro-interactions, responsive mobile-first layouts, and cross-browser reliability.
• Understanding of automated UI testing (Cypress, Jest, React Testing Library).`
  },
  {
    id: 'swiggy_fullstack',
    title: 'SDE Intern / Full-Stack Engineer (Instamart Fleet)',
    company: 'Swiggy',
    location: 'Bangalore, Karnataka / Hybrid',
    salary: '₹60,000/month Internship → PPO: ₹20 LPA',
    description: `Join Swiggy's Instamart Engineering group building instant commerce logistics and warehouse routing systems.

Candidate Profile:
• Currently pursuing B.Tech / B.E / Dual Degree in Computer Science, IT, or related circuit branches.
• Fluency in React, Node.js, TypeScript, and SQL databases.
• Strong DSA foundations with active competitive programming experience (LeetCode / Codeforces / CodeChef).
• Experience working with Docker, Git, CI/CD pipelines, and microservice design.
• Passion for solving real-world routing and high-concurrency dispatch challenges in India.`
  }
];

export const MOCK_APPLICATIONS = [
  {
    id: 'app_1',
    company: 'Zomato',
    role: 'SDE-1 (Backend / Platform Engineering)',
    link: 'https://zomato.com/careers',
    status: 'Interviewing',
    appliedDate: '2026-11-04',
    matchScore: 92, // Job Fit %
    notes: 'Cleared Online Assessment (OA). Round 2 Technical DSA & System Design scheduled for Thursday.',
    logo: 'https://b.zmtcdn.com/images/logo/zomato_logo_2017.png'
  },
  {
    id: 'app_2',
    company: 'Razorpay',
    role: 'Software Development Engineer — Payments UI',
    link: 'https://razorpay.com/jobs',
    status: 'Interviewing',
    appliedDate: '2026-11-02',
    matchScore: 89,
    notes: 'Machine Coding round completed. Awaiting Managerial / Culture fit discussion.',
    logo: 'https://razorpay.com/favicon.ico'
  },
  {
    id: 'app_3',
    company: 'Flipkart',
    role: 'SDE-1 (Off-Campus Placement Drive)',
    link: 'https://flipkartcareers.com',
    status: 'Offered',
    appliedDate: '2026-10-21',
    matchScore: 91,
    notes: 'Received competitive campus offer letter! CTC: ₹24 LPA. Offer acceptance deadline Dec 5th.',
    logo: 'https://img1a.flixcart.com/www/linchpin/fk-cp-zion/img/flipkart-plus_8d85f4.png'
  },
  {
    id: 'app_4',
    company: 'CRED',
    role: 'Backend Platform Engineer',
    link: 'https://cred.club/careers',
    status: 'Applied',
    appliedDate: '2026-11-07',
    matchScore: 85,
    notes: 'Referred by college alumni mentor. Application status shows Under Review on Greenhouse.',
    logo: 'https://cred.club/favicon.ico'
  },
  {
    id: 'app_5',
    company: 'Swiggy',
    role: 'SDE Intern — Instamart Fleet',
    link: 'https://careers.swiggy.com',
    status: 'Applied',
    appliedDate: '2026-11-06',
    matchScore: 84,
    notes: 'HackerEarth Online Coding test submitted (all 3 DSA test cases passed).',
    logo: 'https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/portal/m/seo/swiggy_icon.png'
  },
  {
    id: 'app_6',
    company: 'TCS Digital',
    role: 'Digital SDE (Prime Track)',
    link: 'https://nextstep.tcs.com',
    status: 'Offered',
    appliedDate: '2026-10-14',
    matchScore: 95,
    notes: 'Day 1 On-Campus Placement offer secured (Digital Prime Band). Safe backup in hand.',
    logo: 'https://www.tcs.com/favicon.ico'
  }
];

export const TECH_SKILLS_DICTIONARY = [
  'C++', 'Java', 'Python', 'TypeScript', 'JavaScript', 'React', 'Node.js', 'Express', 'FastAPI',
  'PostgreSQL', 'Prisma', 'MongoDB', 'Redis', 'Docker', 'AWS', 'Kubernetes',
  'Git', 'Tailwind CSS', 'Next.js', 'PyTorch', 'scikit-learn', 'TF-IDF',
  'GraphQL', 'REST APIs', 'CI/CD', 'Go', 'Linux', 'SQL', 'Kafka', 'RabbitMQ',
  'Jest', 'Cypress', 'System Design', 'Microservices', 'Data Structures & Algorithms', 'OOP'
];
