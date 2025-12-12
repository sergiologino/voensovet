const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Проверка и предупреждение если используется HTTPS для localhost
if (API_BASE_URL.startsWith('https://localhost') || API_BASE_URL.startsWith('https://127.0.0.1')) {
  console.warn('⚠️ ВНИМАНИЕ: Используется HTTPS для localhost. Для локальной разработки используйте HTTP: http://localhost:3001');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(phone: string, password: string, captcha: string) {
    return request<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password, captcha }),
    });
  },

  async register(phone: string, password: string, fullName?: string, captcha?: string) {
    return request<{ user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone, password, fullName, captcha }),
    });
  },

  async logout() {
    return request('/api/auth/logout', {
      method: 'POST',
    });
  },

  async getCurrentUser() {
    return request<{ user: any }>('/api/auth/me');
  },

  // User
  async getProfile() {
    return request<{ user: any }>('/api/user/profile');
  },

  async updateProfile(data: { fullName?: string; email?: string; phone?: string }) {
    return request<{ user: any }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return request<{ message: string }>('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async getUserRequests(limit = 50, offset = 0) {
    return request<{ requests: any[]; total: number }>(
      `/api/user/requests?limit=${limit}&offset=${offset}`
    );
  },

  async trackPageVisit(pageUrl: string, pageTitle?: string) {
    return request('/api/user/requests', {
      method: 'POST',
      body: JSON.stringify({ pageUrl, pageTitle }),
    });
  },

  // Admin
  async getAdminSettings() {
    return request<{ settings: any }>('/api/admin/settings');
  },

  async updateAdminSettings(primaryPrompt?: string, secondaryPrompt?: string) {
    return request<{ settings: any }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ primaryPrompt, secondaryPrompt }),
    });
  },

  async getAdminStats() {
    return request<{ totalUsers: number; activeUsers: number; totalRequests: number; totalAiRequests: number }>(
      '/api/admin/users/stats'
    );
  },

  async getUsers(limit = 50, offset = 0) {
    return request<{ users: any[]; total: number }>(
      `/api/admin/users?limit=${limit}&offset=${offset}`
    );
  },

  async getAiRequests(limit = 50, offset = 0) {
    return request<{ requests: any[]; total: number }>(
      `/api/admin/ai-requests?limit=${limit}&offset=${offset}`
    );
  },

  // AI
  async getAiNetworks() {
    return request<{ networks: any[] }>('/api/ai/networks');
  },

  async processAiRequest(userQuery: string, regionName?: string) {
    return request<{
      success: boolean;
      shortAnswer: string;
      detailedAnswer: string;
      analysis: string;
      networkUsed: string;
      tokensUsed: number;
      executionTimeMs: number;
    }>('/api/ai/process', {
      method: 'POST',
      body: JSON.stringify({ userQuery, regionName }),
    });
  },

  async getAiHistory(limit = 20, offset = 0) {
    return request<{ requests: any[]; total: number }>(
      `/api/ai/history?limit=${limit}&offset=${offset}`
    );
  },
};



