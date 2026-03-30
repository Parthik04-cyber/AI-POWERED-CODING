import { IUser } from '../models/User';
export type AccessStatus = 'subscribed' | 'trial' | 'expired';
export interface UserAccessState {
    hasAccess: boolean;
    status: AccessStatus;
    trialEndsAt?: Date;
    subscriptionExpiresAt?: Date;
}
export declare const getTrialEndsAt: (user: IUser) => Date | undefined;
export declare const ensureTrialStarted: (user: IUser) => boolean;
export declare const getUserAccessState: (user: IUser) => UserAccessState;
export declare const getNextMonthlyExpiry: (baseDate?: Date) => Date;
export declare const TRIAL_EXPIRED_MESSAGE = "Your free trial has expired. Please subscribe to continue using CodeMaster.";
//# sourceMappingURL=accessService.d.ts.map