/**
 * AI Career Copilot — Production API Client
 * Connects to Express API Gateway on port 5000 with JWT Authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('copilot_token');
  const headers = {
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiClient = {
  /**
   * Healthcheck diagnostic
   */
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { online: true, data };
    } catch (err) {
      return { online: false, error: err.message };
    }
  },

  /**
   * User Registration
   */
  async register(name, email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password }),
        signal: AbortSignal.timeout(8000)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * User Login
   */
  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(8000)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Google OAuth Sign-In / Sign-Up
   */
  async googleAuth(googleData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(googleData),
        signal: AbortSignal.timeout(10000)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google authentication failed');
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Get Current Authenticated Profile
   */
  async getProfile() {
    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) {
        // Fallback to /auth/me if /users/profile isn't available
        const fallbackRes = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: getAuthHeaders(),
          signal: AbortSignal.timeout(5000)
        });
        const fallbackData = await fallbackRes.json();
        if (!fallbackRes.ok) throw new Error(fallbackData.message || 'Failed to fetch user profile');
        return { success: true, user: fallbackData.user };
      }
      const data = await res.json();
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Update Student Profile (Name, College, Grad Year, Target Role, LeetCode, GitHub)
   */
  async updateProfile(profileData) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData),
        signal: AbortSignal.timeout(8000)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Submit Onboarding Details
   */
  async updateOnboarding(onboardingData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/onboarding`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(onboardingData),
        signal: AbortSignal.timeout(8000)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save onboarding');
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Update DSA Tracker Stats
   */
  async updateDsa(dsaData) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/dsa`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dsaData),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) {
        // Fallback to /auth/dsa
        const fallbackRes = await fetch(`${API_BASE_URL}/auth/dsa`, {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dsaData),
          signal: AbortSignal.timeout(5000)
        });
        const fallbackData = await fallbackRes.json();
        if (!fallbackRes.ok) throw new Error(fallbackData.message || 'Failed to update DSA stats');
        return { success: true, user: fallbackData.user };
      }
      const data = await res.json();
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Upload Real PDF Resume with Multer & AI parsing
   */
  async uploadResume(file) {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const token = localStorage.getItem('copilot_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/resume/upload`, {
        method: 'POST',
        headers,
        body: formData,
        signal: AbortSignal.timeout(30000)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMsg = data.error || data.message || (res.status === 400 ? 'Invalid Document. Please upload a standard Resume.' : 'Server error during upload.');
        return { 
          success: false, 
          error: errorMsg, 
          status: res.status,
          isAiOffline: res.status >= 500
        };
      }
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        error: 'Server error during upload.',
        status: 503,
        isAiOffline: true 
      };
    }
  },

  /**
   * Fetch All User Resumes
   */
  async getResumes() {
    try {
      const res = await fetch(`${API_BASE_URL}/resume`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch resumes');
      return { success: true, resumes: data.resumes || [] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Match Job Description against Resume Skills
   */
  async matchJob(resumeId, resumeText, jobDescription, company = 'Target Company', roleTitle = 'Software Engineer') {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/match`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeId,
          resumeText,
          jobDescription,
          company,
          roleTitle
        }),
        signal: AbortSignal.timeout(20000)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { 
          success: false, 
          error: data.message || 'Server unavailable.', 
          status: res.status,
          isAiOffline: res.status >= 500
        };
      }
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        error: 'Server unavailable.',
        status: 503,
        isAiOffline: true 
      };
    }
  },

  /**
   * Fetch Past Match History
   */
  async getMatchHistory() {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/history`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch match history');
      return { success: true, history: data.history || [] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetch Applications
   */
  async getApplications() {
    try {
      const res = await fetch(`${API_BASE_URL}/applications`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch applications');
      return { success: true, applications: data.applications || [] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Create Job Application Record
   */
  async createApplication(appData) {
    try {
      const res = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appData),
        signal: AbortSignal.timeout(6000)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save application');
      return { success: true, application: data.application };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Update Application Status
   */
  async updateApplication(id, appData) {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appData),
        signal: AbortSignal.timeout(5000)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update application');
      return { success: true, application: data.application };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Delete Application
   */
  async deleteApplication(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete application');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Feature 1: Placement Readiness Engine Data Aggregation
   */
  async getPlacementReadiness() {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/readiness`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(8000)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Server unavailable.');
      return { success: true, readiness: data.readiness };
    } catch (err) {
      return { success: false, error: 'Server unavailable.' };
    }
  },

  /**
   * Feature 2: Stateful Mock Interview - Start Session
   */
  async startMockInterview(role = 'Software Development Engineer (SDE)', company = 'Tier-1 Campus Placement') {
    try {
      const res = await fetch(`${API_BASE_URL}/interview/start`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role, company }),
        signal: AbortSignal.timeout(10000)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Server unavailable.');
      return { success: true, session: data.session, openingQuestion: data.openingQuestion };
    } catch (err) {
      return { success: false, error: 'Server unavailable.' };
    }
  },

  /**
   * Feature 2: Stateful Mock Interview - Submit Answer
   */
  async submitInterviewAnswer(interviewId, answer, question) {
    try {
      const res = await fetch(`${API_BASE_URL}/interview/answer`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ interviewId, answer, question }),
        signal: AbortSignal.timeout(15000)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Server unavailable.');
      return { 
        success: true, 
        evaluation: data.evaluation, 
        nextQuestion: data.nextQuestion, 
        session: data.session,
        readiness: data.readiness
      };
    } catch (err) {
      return { success: false, error: 'Server unavailable.' };
    }
  },

  /**
   * Feature 2: Fetch Past Mock Interview Sessions
   */
  async getInterviewHistory() {
    try {
      const res = await fetch(`${API_BASE_URL}/interview/history`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch interview history');
      return { success: true, sessions: data.sessions || [] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Feature 2: Fetch Single Interview Session Details
   */
  async getInterviewSession(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/interview/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch interview details');
      return { success: true, session: data.session };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Feature 3: ATS Resume Exporter (Server-Side PDF Streaming)
   * Uses Blob API and URL.createObjectURL to trigger a seamless background download.
   */
  async downloadAtsResume(candidateName = 'Student') {
    try {
      const token = localStorage.getItem('copilot_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/resume/export`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(15000)
      });

      if (!res.ok) {
        throw new Error(`Failed to generate PDF (HTTP ${res.status})`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${candidateName.replace(/[^a-zA-Z0-9]/g, '_')}_ATS_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Feature 4: "Deadline Radar" Time-Series Placement Drives
   */
  async getPlacementDrives() {
    try {
      const res = await fetch(`${API_BASE_URL}/drives`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(6000)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Server unavailable.');
      return { 
        success: true, 
        drives: data.drives || [], 
        urgentCount: data.urgentCount || 0 
      };
    } catch (err) {
      return { success: false, error: 'Server unavailable.' };
    }
  }
};
