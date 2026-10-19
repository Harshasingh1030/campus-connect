/**
 * Demo Authentication Service
 * Simulates user login, logout, and registration using local demo storage.
 * NOTE: For local prototyping only. In production, this will interface with Amazon Cognito.
 */

import { getStore, saveStore } from './storage';
import { INITIAL_USERS } from '../../data/seedData';

export const authDemoService = {
  async getCurrentUser() {
    const store = getStore();
    return store.currentUser || null;
  },

  async login(email, password) {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 250));

    const normalizedEmail = (email || '').trim().toLowerCase();
    const store = getStore();

    // Check existing users
    let user = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      // Allow dynamic student login if email ends with campus.edu or matches demo
      if (normalizedEmail.includes('@campus.edu') || normalizedEmail.includes('student')) {
        user = {
          id: `usr_${Date.now()}`,
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          email: normalizedEmail,
          role: 'student',
          studentId: `CS2026-${Math.floor(100 + Math.random() * 900)}`,
          department: 'Computer Science & Engineering'
        };
        store.users.push(user);
      } else {
        throw new Error('Invalid demo credentials. Use student@campus.edu or admin@campus.edu');
      }
    }

    store.currentUser = user;
    saveStore(store);
    return user;
  },

  async register(registrationData) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const store = getStore();

    const normalizedEmail = registrationData.email.trim().toLowerCase();
    const existing = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error('An account with this campus email already exists.');
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name: registrationData.name,
      email: normalizedEmail,
      role: 'student',
      studentId: registrationData.studentId || `CS2026-${Math.floor(100 + Math.random() * 900)}`,
      department: registrationData.department || 'General Engineering',
      phone: registrationData.phone || ''
    };

    store.users.push(newUser);
    store.currentUser = newUser;
    saveStore(store);
    return newUser;
  },

  async logout() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const store = getStore();
    store.currentUser = null;
    saveStore(store);
    return true;
  },

  async switchRole(role) {
    const store = getStore();
    const targetUser = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    store.currentUser = targetUser;
    saveStore(store);
    return targetUser;
  }
};
