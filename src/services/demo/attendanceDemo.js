/**
 * Demo Attendance Service
 * Handles participant attendance check-in, ticket barcode/QR verification simulation, and CSV export.
 * NOTE: Ticket verification is simulated for development/demo only. In production, an authorized AWS Lambda endpoint verifies signatures and prevents reuse.
 */

import { getStore, saveStore } from './storage';

export const attendanceDemoService = {
  /**
   * Simulates ticket verification by ticket code or registration ID
   */
  async verifyTicket(ticketCodeOrId) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!ticketCodeOrId || !ticketCodeOrId.trim()) {
      throw new Error('Please enter a ticket code or registration ID.');
    }

    const cleanCode = ticketCodeOrId.trim().toUpperCase();
    const store = getStore();

    const registration = store.registrations.find(
      (r) =>
        r.id.toUpperCase() === cleanCode ||
        (r.ticketCode && r.ticketCode.toUpperCase() === cleanCode)
    );

    if (!registration) {
      return {
        valid: false,
        message: 'No matching ticket found in registration database.'
      };
    }

    if (registration.status === 'cancelled') {
      return {
        valid: false,
        registration,
        message: 'This registration has been cancelled by the student or administrator.'
      };
    }

    const event = store.events.find((e) => e.id === registration.eventId);

    return {
      valid: true,
      registration,
      event,
      isAlreadyCheckedIn: registration.attendance === 'present',
      message: registration.attendance === 'present'
        ? 'Participant has already been checked in!'
        : 'Valid ticket verified successfully.'
    };
  },

  /**
   * Mark attendance status (present / absent)
   */
  async markAttendance(registrationId, status = 'present') {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const store = getStore();

    const reg = store.registrations.find((r) => r.id === registrationId);
    if (!reg) {
      throw new Error('Registration record not found.');
    }

    reg.attendance = status;
    reg.attendanceUpdatedAt = new Date().toISOString();

    saveStore(store);
    return reg;
  },

  /**
   * Exports participant list as a standard CSV download
   */
  exportToCsv(registrations, eventTitle = 'CampusConnect_Participants') {
    if (!registrations || registrations.length === 0) {
      throw new Error('No participant records to export.');
    }

    const headers = [
      'Registration ID',
      'Ticket Code',
      'Student Name',
      'Registration No',
      'Department',
      'Email',
      'Event Title',
      'Registration Date',
      'Status',
      'Attendance'
    ];

    const rows = registrations.map((r) => [
      `"${r.id}"`,
      `"${r.ticketCode || ''}"`,
      `"${r.studentName}"`,
      `"${r.studentRegNo || ''}"`,
      `"${r.department || ''}"`,
      `"${r.studentEmail}"`,
      `"${(r.eventTitle || '').replace(/"/g, '""')}"`,
      `"${new Date(r.registeredAt).toLocaleString()}"`,
      `"${r.status}"`,
      `"${r.attendance}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const sanitizedTitle = eventTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    link.setAttribute('download', `${sanitizedTitle}_participants_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  }
};
