/**
 * Production Authentication Service
 * Targets AWS API Gateway & Amazon Cognito endpoints.
 * 
 * In production:
 * - Direct authentication via Amazon Cognito Identity SDK or AWS Amplify Auth
 * - Or through an API Gateway Lambda Authorizer proxy.
 */

import { apiClient } from '../apiClient';

export const authApiService = {
  async getCurrentUser() {
    return apiClient.get('/auth/me');
  },

  async login(email, password) {
    return apiClient.post('/auth/login', { email, password });
  },

  async register(registrationData) {
    return apiClient.post('/auth/register', registrationData);
  },

  async logout() {
    return apiClient.post('/auth/logout', {});
  },

  async switchRole(role) {
    throw new Error('Role switching is only supported in demo mode. In production, roles are assigned in Amazon Cognito groups.');
  }
};
