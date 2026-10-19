/**
 * Production Attendance Service
 * Submits ticket verification and check-ins to authorized AWS Lambda endpoints.
 */

import { apiClient } from '../apiClient';

export const attendanceApiService = {
  async verifyTicket(ticketCodeOrId) {
    return apiClient.post('/admin/attendance/verify', { ticketCode: ticketCodeOrId });
  },

  async markAttendance(registrationId, status = 'present') {
    return apiClient.post(`/admin/attendance/${registrationId}/mark`, { status });
  },

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
