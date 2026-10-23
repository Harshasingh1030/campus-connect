/**
 * Production Registration Service
 * Integrates with AWS API Gateway -> Lambda -> DynamoDB
 * Capacity check and duplicate prevention are executed atomically in DynamoDB TransactWriteItems.
 */

import { apiClient } from '../apiClient';


/**
 * CampusConnect Registration Service
 * AWS API Gateway -> Lambda -> DynamoDB
 */

const REGISTER_API_URL =
  'https://ebgfaxegxb.execute-api.ap-south-1.amazonaws.com/register';

export const registrationApiService = {
  async registerForEvent(eventId, student) {
    const response = await fetch(REGISTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventId: String(eventId),
        studentEmail: String(student.email || '').trim().toLowerCase()
      })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.message || `Registration failed (${response.status})`
      );
    }

    return result;
  },

  async cancelRegistration() {
    throw new Error(
      'Cancellation is not implemented in the current AWS backend.'
    );
  },

  async getStudentRegistrations() {
    throw new Error(
      'Fetching student registrations is not implemented in the current AWS backend.'
    );
  },

  async getEventRegistrations() {
    throw new Error(
      'Fetching event registrations is not implemented in the current AWS backend.'
    );
  },

  async checkRegistrationStatus() {
    throw new Error(
      'Checking registration status is not implemented in the current AWS backend.'
    );
  }
};

