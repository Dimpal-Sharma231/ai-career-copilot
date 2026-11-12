import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('copilot_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on startup
  useEffect(() => {
    const verifyUserSession = async () => {
      const storedToken = localStorage.getItem('copilot_token');
      if (storedToken) {
        try {
          const res = await apiClient.getProfile();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            // Token expired or invalid
            localStorage.removeItem('copilot_token');
            setUser(null);
          }
        } catch (err) {
          console.warn('Session verification error:', err);
        }
      }
      setLoading(false);
    };

    verifyUserSession();
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.login(email, password);
    if (!res.success) {
      throw new Error(res.error || 'Invalid credentials');
    }
    localStorage.setItem('copilot_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await apiClient.register(name, email, password);
    if (!res.success) {
      throw new Error(res.error || 'Registration failed');
    }
    localStorage.setItem('copilot_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const loginWithGoogle = async (googleData) => {
    const res = await apiClient.googleAuth(googleData);
    if (!res.success) {
      throw new Error(res.error || 'Google Sign-In failed');
    }
    localStorage.setItem('copilot_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('copilot_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await apiClient.updateProfile(profileData);
    if (!res.success) {
      throw new Error(res.error || 'Failed to update profile');
    }
    setUser(res.user);
    return res.user;
  };

  const updateOnboarding = async (onboardingData) => {
    const res = await apiClient.updateOnboarding(onboardingData);
    if (!res.success) {
      throw new Error(res.error || 'Failed to complete onboarding');
    }
    setUser(res.user);
    return res.user;
  };

  const updateDsa = async (dsaData) => {
    const res = await apiClient.updateDsa(dsaData);
    if (!res.success) {
      throw new Error(res.error || 'Failed to update DSA stats');
    }
    setUser(res.user);
    return res.user;
  };

  const refreshUser = async () => {
    try {
      const res = await apiClient.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (e) {
      console.warn('Failed to refresh user:', e);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      loginWithGoogle,
      logout,
      updateProfile,
      updateOnboarding,
      updateDsa,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
