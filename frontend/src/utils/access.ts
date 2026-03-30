import { User } from './store';

export type AccessStatus = 'subscribed' | 'trial' | 'expired';

export interface UserAccessState {
  hasAccess: boolean;
  status: AccessStatus;
  trialEndsAt?: Date;
}

const TRIAL_DAYS = 7;

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const parseDate = (value?: string | Date): Date | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const getUserAccessState = (user: User | null): UserAccessState => {
  if (!user) {
    return { hasAccess: false, status: 'expired' };
  }

  if (user.role === 'admin') {
    return { hasAccess: true, status: 'subscribed' };
  }

  const now = new Date();
  const premiumExpiresAt = parseDate(user.premiumExpiresAt);
  const hasActiveSubscription = !!user.isPremium && (!premiumExpiresAt || premiumExpiresAt > now);
  const trialStartedAt = parseDate(user.trialStartedAt);
  const trialEndsAt = trialStartedAt ? addDays(trialStartedAt, TRIAL_DAYS) : undefined;

  if (hasActiveSubscription) {
    return { hasAccess: true, status: 'subscribed', trialEndsAt };
  }

  if (trialEndsAt && trialEndsAt > now) {
    return { hasAccess: true, status: 'trial', trialEndsAt };
  }

  return { hasAccess: false, status: 'expired', trialEndsAt };
};

const FEATURE_PATH_PREFIXES = [
  '/problems',
  '/editor',
  '/contests',
  '/interview',
  '/course',
  '/explore',
  '/discuss',
  '/leaderboard',
  '/store',
  '/submissions',
  '/profile',
  '/settings',
  '/premium',
];

export const isFeaturePath = (pathname: string): boolean => {
  return FEATURE_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};
