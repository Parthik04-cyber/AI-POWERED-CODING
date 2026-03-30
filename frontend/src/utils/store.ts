import { create } from 'zustand';

export interface User {
  userId: string;
  username: string;
  email: string;
  role: string;
  fullName?: string;
  score?: number;
  problemsSolved?: number;
  coins?: number;
  codingStreak?: number;
  isPremium?: boolean;
  premiumPlan?: 'monthly' | 'yearly';
  premiumExpiresAt?: string;
  trialStartedAt?: string;
  trialEndsAt?: string;
  hasActiveAccess?: boolean;
  accessStatus?: 'subscribed' | 'trial' | 'expired';
  badges?: string[];
}

interface AuthStore {
  user: User | null;
  token: string | null;
  initialized: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  initialized: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  logout: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    set({ user: null, token: null });
  },

  init: () => {
    // Clear any tokens left in localStorage from the old persistence scheme
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    try {
      const token = sessionStorage.getItem('token');
      const user = sessionStorage.getItem('user');

      if (token && user) {
        set({
          token,
          user: JSON.parse(user),
          initialized: true,
        });
        return;
      }
    } catch (_error) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }

    set({ initialized: true });
  },
}));

interface EditorStore {
  code: string;
  language: string;
  output: string;
  isRunning: boolean;
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setOutput: (output: string) => void;
  setIsRunning: (isRunning: boolean) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  code: '',
  language: 'javascript',
  output: '',
  isRunning: false,

  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setOutput: (output) => set({ output }),
  setIsRunning: (isRunning) => set({ isRunning }),
}));

interface ProblemStore {
  problems: any[];
  selectedProblem: any | null;
  isLoading: boolean;
  setProblems: (problems: any[]) => void;
  setSelectedProblem: (problem: any | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useProblemStore = create<ProblemStore>((set) => ({
  problems: [],
  selectedProblem: null,
  isLoading: false,

  setProblems: (problems) => set({ problems }),
  setSelectedProblem: (selectedProblem) => set({ selectedProblem }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
