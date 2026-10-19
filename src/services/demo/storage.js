/**
 * Demo Local Storage Adapter
 * Safely manages isolated demo state in browser localStorage.
 * Does NOT overwrite user changes on reload.
 */

import { INITIAL_EVENTS, INITIAL_REGISTRATIONS, INITIAL_USERS } from '../../data/seedData';

const STORAGE_KEY = 'campusconnect_demo_store_v1';

// In-memory fallback if localStorage is unavailable
let memoryStore = null;

function isLocalStorageAvailable() {
  try {
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Initialize storage with seed data only if not already initialized.
 */
export function getStore() {
  if (!isLocalStorageAvailable()) {
    if (!memoryStore) {
      memoryStore = {
        users: INITIAL_USERS,
        events: INITIAL_EVENTS,
        registrations: INITIAL_REGISTRATIONS,
        currentUser: INITIAL_USERS[0]
      };
    }
    return memoryStore;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = {
        users: INITIAL_USERS,
        events: INITIAL_EVENTS,
        registrations: INITIAL_REGISTRATIONS,
        currentUser: INITIAL_USERS[0],
        version: 1,
        initializedAt: new Date().toISOString()
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading demo storage, falling back to seed:', err);
    return {
      users: INITIAL_USERS,
      events: INITIAL_EVENTS,
      registrations: INITIAL_REGISTRATIONS,
      currentUser: INITIAL_USERS[0]
    };
  }
}

/**
 * Save store updates back to storage
 */
export function saveStore(store) {
  if (!isLocalStorageAvailable()) {
    memoryStore = store;
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
  }
}

/**
 * Helper to hard reset demo state to original seed data
 */
export function resetToSeedData() {
  const initial = {
    users: INITIAL_USERS,
    events: INITIAL_EVENTS,
    registrations: INITIAL_REGISTRATIONS,
    currentUser: INITIAL_USERS[0],
    version: 1,
    initializedAt: new Date().toISOString()
  };
  saveStore(initial);
  return initial;
}
