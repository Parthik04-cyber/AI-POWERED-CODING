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
        badges: string[];
    };
    token: string;
}
declare class AuthService {
    private getJwtSecret;
    private getJwtExpire;
    generateToken(userId: string, email: string, role: string): string;
    register(username: string, email: string, password: string, fullName: string): Promise<AuthResponse>;
    login(email: string, password: string): Promise<AuthResponse>;
    getUserProfile(userId: string): Promise<IUser>;
    updateUserProfile(userId: string, updateData: Partial<IUser>): Promise<IUser>;
    getAllUsers(): Promise<IUser[]>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=authService.d.ts.map