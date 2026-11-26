// Используем пустую строку для относительных URL (проксирование через Nginx)
// или полный URL если указан в переменных окружения
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface BenefitMeasure {
  id: number;
  title: string;
  topic: 'work' | 'business' | 'education' | 'health' | 'house' | 'housing' | 'payments';
  scope: 'federal' | 'regional';
  region_id: string | null;
  locality: string;
  audiences: string[];
  match_rules: MatchRules;
  summary: string;
  eligibility: string;
  exclusions: string;
  documents: string[];
  steps: { title: string; detail: string }[];
  agency: string;
  apply_url: string;
  timing: string;
  source_url: string;
  source_checked_at: string | null;
  date_end: string | null;
  status: 'draft' | 'published';
  created_at?: string;
  updated_at?: string;
}

export interface MatchRules {
  family_relationship?: 'spouse' | 'parent' | 'child' | 'other';
  participant_disability?: ('I' | 'II' | 'III')[];
  min_children?: number;
  housing?: NavigatorProfile['housing'];
  requires_award?: boolean;
  requires_veteran_card?: boolean;
}

export interface NavigatorProfile {
  audience: 'veteran' | 'status-pending' | 'family' | 'bereaved-family';
  disability: 'none' | 'I' | 'II' | 'III' | 'unknown';
  relationship: 'spouse' | 'parent' | 'child' | 'other' | 'none';
  children_count: number;
  housing: 'own-home' | 'own-flat' | 'rent' | 'with-family' | 'other';
}

export interface NavigatorMatch { measure: BenefitMeasure; reasons: string[]; checks: string[] }

export interface NavigatorRoute {
  measure_id: number;
  saved_at: string;
  updated_at: string;
  available: boolean;
  completed_step_indices: number[];
  measure: { id: number; title: string; topic: BenefitMeasure['topic']; steps: BenefitMeasure['steps'] };
}

export type BenefitMeasureInput = Omit<BenefitMeasure, 'id' | 'status' | 'updated_at'>;

// Отладка для проверки переменных окружения
console.log('🔍 API Configuration:');
console.log('  VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('  API_BASE_URL:', API_BASE_URL);
console.log('  Mode:', import.meta.env.MODE);

// Проверка и предупреждение если используется HTTPS для localhost
if (API_BASE_URL.startsWith('https://localhost') || API_BASE_URL.startsWith('https://127.0.0.1')) {
  console.warn('⚠️ ВНИМАНИЕ: Используется HTTPS для localhost. Для локальной разработки используйте HTTP: http://localhost:3001');
}

// Предупреждение если используется прямой URL с портом (должно быть через прокси)
if (API_BASE_URL.includes(':3002')) {
  console.error('❌ ОШИБКА: API_BASE_URL содержит :3002!');
  console.error('   Это значит, что переменная VITE_API_URL установлена в Timeweb.');
  console.error('   РЕШЕНИЕ: Удалите переменные VITE_API_URL и VITE_API_BASE_URL в настройках Timeweb.');
  console.error('   API должен работать через Nginx прокси: /api/* → http://api:3002');
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

  async register(phone: string, password: string, fullName?: string, captcha?: string, regionId?: string) {
    return request<{ user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone, password, fullName, captcha, regionId }),
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

  async startYandexLink() {
    return request<{ url: string }>('/api/auth/yandex/link', { method: 'POST' });
  },

  // User
  async getEnabledRegions() {
    return request<{ regionIds: string[] }>('/api/regions');
  },

  async getProfile() {
    return request<{ user: any }>('/api/user/profile');
  },

  async updateProfile(data: { fullName?: string; email?: string; phone?: string; regionId?: string }) {
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

  async updateAdminSettings(primaryPrompt?: string, secondaryPrompt?: string, enabledRegions?: string[]) {
    return request<{ settings: any }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ primaryPrompt, secondaryPrompt, enabledRegions }),
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

  async getAdminMeasures(filters: { status?: string; scope?: string; regionId?: string; topic?: string; search?: string; validity?: string } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
    return request<{ measures: BenefitMeasure[] }>(`/api/admin/measures${params.size ? `?${params}` : ''}`);
  },

  async createAdminMeasure(measure: BenefitMeasureInput) {
    return request<{ measure: BenefitMeasure }>('/api/admin/measures', { method: 'POST', body: JSON.stringify(measure) });
  },

  async updateAdminMeasure(id: number, measure: BenefitMeasureInput) {
    return request<{ measure: BenefitMeasure }>(`/api/admin/measures/${id}`, { method: 'PUT', body: JSON.stringify(measure) });
  },

  async publishAdminMeasure(id: number) {
    return request<{ measure: BenefitMeasure }>(`/api/admin/measures/${id}/publish`, { method: 'POST' });
  },

  async unpublishAdminMeasure(id: number) {
    return request<{ measure: BenefitMeasure }>(`/api/admin/measures/${id}/unpublish`, { method: 'POST' });
  },

  async getPublishedMeasures(regionId: string | null, locality = '') {
    const params = new URLSearchParams();
    if (regionId) params.set('regionId', regionId);
    if (locality) params.set('locality', locality);
    return request<{ measures: BenefitMeasure[] }>(`/api/measures${params.size ? `?${params}` : ''}`);
  },

  async getNavigatorProfile() {
    return request<{ profile: NavigatorProfile | null }>('/api/navigator/profile');
  },

  async saveNavigatorProfile(profile: NavigatorProfile) {
    return request<{ profile: NavigatorProfile }>('/api/navigator/profile', { method: 'PUT', body: JSON.stringify(profile) });
  },

  async getNavigatorMatches(topic: string, locality = '') {
    const params = new URLSearchParams({ topic });
    if (locality) params.set('locality', locality);
    return request<{ matches: NavigatorMatch[] }>(`/api/navigator/matches?${params}`);
  },

  async getNavigatorRoutes() {
    return request<{ routes: NavigatorRoute[] }>('/api/navigator/progress');
  },

  async saveNavigatorRoute(measureId: number, locality = '') {
    return request<{ message: string }>(`/api/navigator/progress/${measureId}`, { method: 'POST', body: JSON.stringify({ locality }) });
  },

  async setNavigatorStep(measureId: number, stepIndex: number, completed: boolean) {
    return request<{ completed_step_index: number; completed: boolean }>(`/api/navigator/progress/${measureId}/steps/${stepIndex}`, { method: 'PUT', body: JSON.stringify({ completed }) });
  },

  async removeNavigatorRoute(measureId: number) {
    return request<{ message: string }>(`/api/navigator/progress/${measureId}`, { method: 'DELETE' });
  },

  // Get user's own AI requests
  async getUserAiRequests() {
    return request<{ requests: any[] }>('/api/ai/history');
  },

  // Alias for getUserAiRequests (used in ProfilePage)
  async getAiHistory(limit = 100, offset = 0) {
    return request<{ requests: any[]; total?: number }>(
      `/api/ai/history?limit=${limit}&offset=${offset}`
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
};



