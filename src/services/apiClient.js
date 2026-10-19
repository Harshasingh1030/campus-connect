/**
 * Centralized API Client for AWS API Gateway Integration
 * Handles HTTP requests, auth headers (Cognito ID/Access tokens), and standard error parsing.
 * 
 * IMPORTANT:
 * - Does NOT silently fallback to demo/mock data if API calls fail.
 * - Errors are propagated transparently so issues in Lambda or API Gateway can be identified.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiClient {
  constructor() {
    this.tokenGetter = null;
  }

  /**
   * Set custom token supplier (e.g. from Cognito Auth session)
   */
  setTokenGetter(fn) {
    this.tokenGetter = fn;
  }

  async request(endpoint, options = {}) {
    if (!BASE_URL) {
      throw new Error(
        'VITE_API_BASE_URL is not configured in your environment. Set VITE_API_BASE_URL or switch VITE_USE_MOCK_DATA=true for demo mode.'
      );
    }

    const url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers
    };

    if (this.tokenGetter) {
      const token = await this.tokenGetter();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: await response.text() };
        }

        const error = new Error(
          errorData?.message || `API request failed with status ${response.status} (${response.statusText})`
        );
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (err) {
      // Re-throw transparently - do not mask with mock data!
      console.error(`[ApiClient Error] ${options.method || 'GET'} ${url}:`, err);
      throw err;
    }
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  post(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers
    });
  }

  put(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers
    });
  }

  patch(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers
    });
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
