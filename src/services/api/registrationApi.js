/**
 * Production Registration Service
 * Integrates with AWS API Gateway -> Lambda -> DynamoDB
 * Capacity check and duplicate prevention are executed atomically in DynamoDB TransactWriteItems.
 */

import { apiClient } from '../apiClient';

export const registrationApiService = {
  async registerForEvent(eventId, student) {
    return apiClient.post(`/events/${eventId}/registrations`, {
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentRegNo: student.studentId,
      department: student.department
    });
  },

  async cancelRegistration(registrationId) {
    return apiClient.post(`/registrations/${registrationId}/cancel`, {});
  },

  async getStudentRegistrations(studentId) {
    return apiClient.get('/me/registrations');
  },

  async getEventRegistrations(eventId) {
    return apiClient.get(`/admin/events/${eventId}/registrations`);
  },

  async checkRegistrationStatus(eventId, studentId) {
    return apiClient.get(`/events/${eventId}/registration-status`);
  }
};
