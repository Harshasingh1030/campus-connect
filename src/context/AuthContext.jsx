import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, isDemoMode, resetToSeedData } from '../services';

/**
 * ARCHITECTURAL NOTICE:
 * Client-side role checking in this context is strictly for User Experience (UX) and navigation gating.
 * In production, actual authorization and access control MUST be enforced on the backend via
 * AWS Lambda Authorizers, Amazon Cognito User Pool Groups, and IAM execution policies.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize current user
  useEffect(() => {
    async function initAuth() {
      try {
        const current = await authService.getCurrentUser();
        setUser(current);
      } catch (err) {
        console.error('Failed to load active session:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (registrationData) => {
    setIsLoading(true);
    try {
      const newUser = await authService.register(registrationData);
      setUser(newUser);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchRole = useCallback(async (role) => {
    if (!isDemoMode()) {
      throw new Error('Role switching is only enabled in demo mode.');
    }
    setIsLoading(true);
    try {
      const switchedUser = await authService.switchRole(role);
      setUser(switchedUser);
      return switchedUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetDemoState = useCallback(() => {
    resetToSeedData();
    window.location.reload();
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    isLoading,
    isDemo: isDemoMode(),
    login,
    register,
    logout,
    switchRole,
    resetDemoState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
