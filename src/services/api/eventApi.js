/**
 * Production Event Service
 * Communicates with AWS Lambda endpoints via API Gateway.
 */

import { apiClient } from '../apiClient';

export const eventApiService = {
  async getEvents(filters = {}) {
    const query = new URLSearchParams();
    if (filters.search) query.append('q', filters.search);
    if (filters.category && filters.category !== 'all') query.append('category', filters.category);
    if (filters.status && filters.status !== 'all') query.append('status', filters.status);
    if (filters.startDate) query.append('startDate', filters.startDate);
    if (filters.endDate) query.append('endDate', filters.endDate);
    if (filters.venue && filters.venue !== 'all') query.append('venue', filters.venue);
    if (filters.sortBy) query.append('sortBy', filters.sortBy);

    const queryString = query.toString();
    return apiClient.get(`/events${queryString ? `?${queryString}` : ''}`);
  },

  async getEventById(id) {
    return apiClient.get(`/events/${id}`);
  },

  async createEvent(eventData) {
    return apiClient.post('/admin/events', eventData);
  },

  async updateEvent(id, updateData) {
    return apiClient.put(`/admin/events/${id}`, updateData);
  },

  async publishEvent(id) {
    return apiClient.patch(`/admin/events/${id}/status`, { status: 'published' });
  },

  async unpublishEvent(id) {
    return apiClient.patch(`/admin/events/${id}/status`, { status: 'draft' });
  },

  async cancelEvent(id) {
    return apiClient.patch(`/admin/events/${id}/status`, { status: 'cancelled' });
  },

  async deleteDraftEvent(id) {
    return apiClient.delete(`/admin/events/${id}`);
  },

  async getDashboardStats() {
    return apiClient.get('/admin/dashboard/stats');
  }
};
