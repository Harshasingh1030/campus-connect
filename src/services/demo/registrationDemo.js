/**
 * Demo Registration Service
 * Simulates event registrations, duplicate checks, atomic capacity management, and cancellations.
 * In AWS production, this logic will be enforced atomically via DynamoDB TransactWriteItems or Conditional Expressions.
 */

import { getStore, saveStore } from './storage';

export const registrationDemoService = {
  async registerForEvent(eventId, student) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const store = getStore();

    // 1. Validate Event
    const event = store.events.find((e) => e.id === eventId);
    if (!event) {
      throw new Error('Event not found.');
    }

    if (event.status !== 'published') {
      throw new Error('Registration is closed for this event.');
    }

    // 2. Validate Deadline
    const now = new Date().toISOString();
    if (event.registrationDeadline && now > event.registrationDeadline) {
      throw new Error('Registration deadline for this event has passed.');
    }

    // 3. Prevent Duplicate Registration (Simulates DynamoDB attribute_not_exists check)
    const existingRegistration = store.registrations.find(
      (r) =>
        r.eventId === eventId &&
        (r.studentId === student.id || r.studentEmail?.toLowerCase() === student.email?.toLowerCase()) &&
        r.status === 'confirmed'
    );

    if (existingRegistration) {
      throw new Error('You are already registered for this event. View your ticket in My Registrations.');
    }

    // 4. Validate Capacity Limit (Simulates DynamoDB conditional update: registeredCount < maxParticipants)
    if ((event.registeredCount || 0) >= event.maxParticipants) {
      throw new Error('Sorry, this event has reached its maximum participant capacity.');
    }

    // 5. Generate Registration Record with unique Ticket Code
    const regNum = Math.floor(1000 + Math.random() * 9000);
    const catCode = (event.category || 'GEN').substring(0, 3).toUpperCase();
    const ticketCode = `CC-${catCode}-2026-${regNum}`;

    const newRegistration = {
      id: `reg-${Date.now().toString(36)}`,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.eventDate,
      venue: event.venue,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentRegNo: student.studentId || 'STUDENT-NA',
      department: student.department || 'General',
      registeredAt: new Date().toISOString(),
      status: 'confirmed',
      attendance: 'pending',
      ticketCode
    };

    // Increment event registeredCount
    event.registeredCount = (event.registeredCount || 0) + 1;

    store.registrations.unshift(newRegistration);
    saveStore(store);

    return newRegistration;
  },

  async cancelRegistration(registrationId, studentId) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const store = getStore();

    const regIndex = store.registrations.findIndex(
      (r) => r.id === registrationId && (!studentId || r.studentId === studentId)
    );

    if (regIndex === -1) {
      throw new Error('Registration record not found or you are not authorized to cancel it.');
    }

    const registration = store.registrations[regIndex];
    if (registration.status === 'cancelled') {
      throw new Error('Registration is already cancelled.');
    }

    // Mark as cancelled
    registration.status = 'cancelled';
    registration.cancelledAt = new Date().toISOString();

    // Decrement event registeredCount
    const event = store.events.find((e) => e.id === registration.eventId);
    if (event && event.registeredCount > 0) {
      event.registeredCount -= 1;
    }

    saveStore(store);
    return registration;
  },

  async getStudentRegistrations(studentId) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const store = getStore();
    return store.registrations.filter((r) => r.studentId === studentId);
  },

  async getEventRegistrations(eventId) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const store = getStore();
    if (!eventId || eventId === 'all') {
      return store.registrations;
    }
    return store.registrations.filter((r) => r.eventId === eventId);
  },

  async checkRegistrationStatus(eventId, studentId) {
    const store = getStore();
    const reg = store.registrations.find(
      (r) => r.eventId === eventId && r.studentId === studentId && r.status === 'confirmed'
    );
    return {
      isRegistered: Boolean(reg),
      registration: reg || null
    };
  }
};
