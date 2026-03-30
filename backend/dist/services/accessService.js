"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRIAL_EXPIRED_MESSAGE = exports.getNextMonthlyExpiry = exports.getUserAccessState = exports.ensureTrialStarted = exports.getTrialEndsAt = void 0;
const TRIAL_DAYS = 7;
const MONTHLY_SUBSCRIPTION_DAYS = 30;
const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};
const getTrialEndsAt = (user) => {
    if (!user.trialStartedAt) {
        return undefined;
    }
    return addDays(user.trialStartedAt, TRIAL_DAYS);
};
exports.getTrialEndsAt = getTrialEndsAt;
const ensureTrialStarted = (user) => {
    if (user.role === 'admin') {
        return false;
    }
    if (user.trialStartedAt) {
        return false;
    }
    user.trialStartedAt = new Date();
    return true;
};
exports.ensureTrialStarted = ensureTrialStarted;
const getUserAccessState = (user) => {
    if (user.role === 'admin') {
        return {
            hasAccess: true,
            status: 'subscribed',
            trialEndsAt: (0, exports.getTrialEndsAt)(user),
            subscriptionExpiresAt: user.premiumExpiresAt,
        };
    }
    const now = new Date();
    const trialEndsAt = (0, exports.getTrialEndsAt)(user);
    const hasActiveSubscription = !!user.isPremium && (!user.premiumExpiresAt || user.premiumExpiresAt > now);
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
exports.getUserAccessState = getUserAccessState;
const getNextMonthlyExpiry = (baseDate) => {
    return addDays(baseDate || new Date(), MONTHLY_SUBSCRIPTION_DAYS);
};
exports.getNextMonthlyExpiry = getNextMonthlyExpiry;
exports.TRIAL_EXPIRED_MESSAGE = 'Your free trial has expired. Please subscribe to continue using CodeMaster.';
//# sourceMappingURL=accessService.js.map