import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses — only force-logout when a token WAS provided and explicitly rejected
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = !!error.config?.headers?.Authorization;
    const status = error.response?.status;
    const backendMessage = (error.response?.data?.error || error.response?.data?.message || '').toString().toLowerCase();
    const isTokenRejected =
      backendMessage.includes('invalid or expired token') ||
      backendMessage.includes('jwt expired') ||
      backendMessage.includes('invalid token') ||
      backendMessage.includes('token expired');

    // Do not clear session for every 401. Some endpoints can return 401 for reasons
    // unrelated to token validity (for example role/route guards).
    if (status === 401 && hadToken && isTokenRejected) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: { username: string; email: string; password: string; fullName: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  forgotPassword: (data: { email: string }) => api.post('/auth/forgot-password', data),
  resetPassword: (data: { token: string; newPassword: string }) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  getUsers: () => api.get('/auth/users'),
};

// Problem APIs
export const problemAPI = {
  getAllProblems: (skip = 0, limit = 10, difficulty?: string, category?: string) =>
    api.get('/problems', { params: { skip, limit, difficulty, category } }),
  getProblemById: (id: string) => api.get(`/problems/${id}`),
  createProblem: (data: any) => api.post('/problems', data),
  updateProblem: (id: string, data: any) => api.put(`/problems/${id}`, data),
  deleteProblem: (id: string) => api.delete(`/problems/${id}`),
  getCategories: () => api.get('/problems/categories'),
  getStats: () => api.get('/problems/stats'),
};

// Submission APIs
export const submissionAPI = {
  submitCode: (data: { problemId: string; code: string; language: string }) =>
    api.post('/submissions', data),
  getSubmissionById: (id: string) => api.get(`/submissions/${id}`),
  getUserSubmissions: (skip = 0, limit = 10) =>
    api.get('/submissions/user', { params: { skip, limit } }),
  getProblemSubmissions: (problemId: string, skip = 0, limit = 10) =>
    api.get(`/submissions/problem/${problemId}`, { params: { skip, limit } }),
  getLeaderboard: (limit = 10) =>
    api.get('/submissions/leaderboard', { params: { limit } }),
  getAllSubmissionsAdmin: (skip = 0, limit = 20) =>
    api.get('/submissions/admin/all', { params: { skip, limit } }),
};

export const leaderboardAPI = {
  getLeaderboard: (limit = 10) => api.get('/leaderboard', { params: { limit } }),
};

export const executeAPI = {
  runCode: (data: { code: string; language: string; input?: string }) =>
    api.post('/execute', data),
};

// Store APIs
export const storeAPI = {
  getOverview: () => api.get('/store/overview'),
  getHistory: (limit = 30) => api.get('/store/history', { params: { limit } }),
  redeemItem: (itemId: string) => api.post('/store/redeem', { itemId }),
  subscribePremium: (plan: 'monthly' | 'yearly') => api.post('/store/premium/subscribe', { plan }),
  claimDailyLogin: () => api.post('/store/daily-login'),
  spinLuckyWheel: () => api.post('/store/lucky-spin'),
  rewardActivity: (activityType: 'contest' | 'interview', referenceId: string) =>
    api.post('/store/earn/activity', { activityType, referenceId }),
  getCoinLeaderboard: (limit = 20) => api.get('/store/coin-leaderboard', { params: { limit } }),
  getAchievements: () => api.get('/store/achievements'),
  getPremiumOverview: () => api.get('/store/overview'),
  subscribePremiumPlan: (plan: 'monthly' | 'yearly') => api.post('/store/premium/subscribe', { plan }),
};

export const contestAPI = {
  getAdminOverview: () => api.get('/contests/admin/overview'),
};

// Discuss / Community APIs
export const discussAPI = {
  getPosts: (params?: { category?: string; skip?: number; limit?: number }) =>
    api.get('/discuss/posts', { params }),
  getPost: (id: string) =>
    api.get(`/discuss/posts/${id}`),
  createPost: (data: {
    title: string;
    description: string;
    category: string;
    tags?: string[];
    type?: string;
    linkedProblemId?: string;
    company?: string;
    pollOptions?: string[];
  }) => api.post('/discuss/posts', data),
  upvotePost: (id: string) => api.post(`/discuss/posts/${id}/upvote`),
  getTrendingTopics: () => api.get('/discuss/trending'),
  getAISuggestion: (postId: string) => api.post(`/discuss/posts/${postId}/ai-suggest`),
  findBuddy: (data: { topics: string[]; level: string; availability: string }) =>
    api.post('/discuss/buddy-finder', data),
};

export default api;
