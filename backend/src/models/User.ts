export interface IUser {
  _id: string;
  username: string;
  email: string;
  password?: string;
  fullName: string;
  role: 'user' | 'admin';
  profileImage?: string;
  bio?: string;
  problemsSolved: number;
  totalSubmissions: number;
  score: number;
  coins: number;
  isPremium: boolean;
  premiumPlan?: 'monthly' | 'yearly';
  premiumExpiresAt?: Date;
  trialStartedAt?: Date;
  dailyLoginStreak: number;
  codingStreak: number;
  lastDailyLoginAt?: Date;
  lastSolvedProblemAt?: Date;
  lastLuckySpinAt?: Date;
  badges: string[];
  solvedProblemIds: string[];
  completedActivityRefs: string[];
  createdAt: Date;
  updatedAt: Date;
}
