import axios, { AxiosError } from 'axios';
import {
  DashboardStats,
  DifficultyLevel,
  GenerateQuizInput,
  Quiz,
  QuizResult,
  RecentActivityItem,
  User,
} from '../types/index.ts';

let inMemoryAuthToken: string | null = null;

export function setAuthToken(token: string | null): void {
  inMemoryAuthToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryAuthToken;
}

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

apiClient.interceptors.request.use((config) => {
  if (inMemoryAuthToken) {
    config.headers.Authorization = `Bearer ${inMemoryAuthToken}`;
  }
  return config;
});

export function extractApiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    if (axiosErr.response?.data?.message) {
      return axiosErr.response.data.message;
    }
    if (axiosErr.message) {
      return axiosErr.message;
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export const authService = {
  async register(payload: { name: string; email: string; password: string }) {
    const { data } = await apiClient.post<{ success: boolean; token: string; user: User }>(
      '/auth/register',
      payload
    );
    return data;
  },

  async login(payload: { email: string; password: string }) {
    const { data } = await apiClient.post<{ success: boolean; token: string; user: User }>(
      '/auth/login',
      payload
    );
    return data;
  },

  async logout() {
    const { data } = await apiClient.post<{ success: boolean }>('/auth/logout');
    return data;
  },

  async me() {
    const { data } = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
    return data.user;
  },
};

export const quizService = {
  async generate(payload: GenerateQuizInput) {
    const { data } = await apiClient.post<{ success: boolean; quiz: Quiz }>(
      '/quizzes/generate',
      payload
    );
    return data.quiz;
  },

  async list(params?: { search?: string; difficulty?: DifficultyLevel | 'All' }) {
    const { data } = await apiClient.get<{ success: boolean; quizzes: Quiz[] }>('/quizzes', {
      params,
    });
    return data.quizzes;
  },

  async getById(id: string) {
    const { data } = await apiClient.get<{ success: boolean; quiz: Quiz }>(`/quizzes/${id}`);
    return data.quiz;
  },

  async remove(id: string) {
    const { data } = await apiClient.delete<{ success: boolean; message: string }>(
      `/quizzes/${id}`
    );
    return data;
  },
};

export const resultService = {
  async submit(payload: {
    quizId: string;
    answers: Array<{ questionIndex: number; selectedAnswer: string }>;
  }) {
    const { data } = await apiClient.post<{
      success: boolean;
      result: QuizResult;
      quiz: Quiz;
    }>('/results/submit', payload);
    return data;
  },

  async list() {
    const { data } = await apiClient.get<{ success: boolean; results: QuizResult[] }>('/results');
    return data.results;
  },

  async getById(id: string) {
    const { data } = await apiClient.get<{
      success: boolean;
      result: QuizResult;
      quiz: Quiz;
    }>(`/results/${id}`);
    return data;
  },
};

export const userService = {
  async getProfile() {
    const { data } = await apiClient.get<{
      success: boolean;
      user: User;
      stats: DashboardStats;
      recentActivity: RecentActivityItem[];
    }>('/users/profile');
    return data;
  },

  async updateProfile(payload: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) {
    const { data } = await apiClient.put<{
      success: boolean;
      message: string;
      user: User;
    }>('/users/profile', payload);
    return data;
  },
};
