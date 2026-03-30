import { IUser } from '../models/User';
export interface AuthResponse {
    user: {
        userId: string;
        username: string;
        email: string;
        role: string;
        fullName?: string;
        coins: number;
        codingStreak: number;
        isPremium: boolean;
        premiumExpiresAt?: Date;
        trialStartedAt?: Date;
        trialEndsAt?: Date;
        hasActiveAccess: boolean;
        accessStatus: 'subscribed' | 'trial' | 'expired';
        badges: string[];
    };
    token: string;
}
declare class AuthService {
    private readonly minimumPasswordLength;
    private getJwtSecret;
    private getJwtExpire;
    private getPasswordResetExpiryMinutes;
    private getPasswordResetBaseUrl;
    private hashPasswordResetToken;
    private buildPasswordResetUrl;
    private validatePasswordStrength;
    private updateUserPassword;
    generateToken(userId: string, email: string, role: string): string;
    register(username: string, email: string, password: string, fullName: string): Promise<AuthResponse>;
    login(email: string, password: string): Promise<AuthResponse>;
    getUserProfile(userId: string): Promise<IUser>;
    updateUserProfile(userId: string, updateData: Partial<IUser>): Promise<IUser>;
    getAllUsers(): Promise<IUser[]>;
    forgotPassword(email: string): Promise<{
        message: string;
        expiresAt?: Date;
        resetToken?: string;
        resetUrl?: string;
        delivery: 'manual' | 'email';
    }>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=authService.d.ts.map