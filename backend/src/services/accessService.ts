import { IUser } from '../models/User';

export type AccessStatus = 'subscribed' | 'trial' | 'expired';

export interface UserAccessState {
  hasAccess: boolean;
  status: AccessStatus;
  trialEndsAt?: Date;
  subscriptionExpiresAt?: Date;
}

const TRIAL_DAYS = 7;
const MONTHLY_SUBSCRIPTION_DAYS = 30;

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const getTrialEndsAt = (user: IUser): Date | undefined => {
  if (!user.trialStartedAt) {
    return undefined;
  }
  return addDays(user.trialStartedAt, TRIAL_DAYS);
};

export const ensureTrialStarted = (user: IUser): boolean => {
  if (user.role === 'admin') {
    return false;
  }

  if (user.trialStartedAt) {
    return false;
  }

  user.trialStartedAt = new Date();
  return true;
};

export const getUserAccessState = (user: IUser): UserAccessState => {
  if (user.role === 'admin') {
    return {
      hasAccess: true,
      status: 'subscribed',
      trialEndsAt: getTrialEndsAt(user),
      subscriptionExpiresAt: user.premiumExpiresAt,
    };
  }

  const now = new Date();
  const trialEndsAt = getTrialEndsAt(user);
  const hasActiveSubscription =
    !!user.isPremium && (!user.premiumExpiresAt || user.premiumExpiresAt > now);

  if (hasActiveSubscription) {
    return {
      hasAccess: true,
      status: 'subscribed',
      trialEndsAt,
      subscriptionExpiresAt: user.premiumExpiresAt,
    };
  }

  if (trialEndsAt && trialEndsAt > now) {
    return {
      hasAccess: true,
      status: 'trial',
      trialEndsAt,
      subscriptionExpiresAt: user.premiumExpiresAt,
    };
  }

  return {
    hasAccess: false,
    status: 'expired',
    trialEndsAt,
    subscriptionExpiresAt: user.premiumExpiresAt,
  };
};

export const getNextMonthlyExpiry = (baseDate?: Date): Date => {
  return addDays(baseDate || new Date(), MONTHLY_SUBSCRIPTION_DAYS);
};

export const TRIAL_EXPIRED_MESSAGE = 'Your free trial has expired. Please subscribe to continue using CodeMaster.';
