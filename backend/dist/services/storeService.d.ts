type PremiumPlan = 'monthly' | 'yearly';
type ActivityType = 'contest' | 'interview';
interface RewardItem {
    id: string;
    title: string;
    description: string;
    cost: number;
    section: 'redeem' | 'premium';
}
declare class StoreService {
    private normalizeDateToUTC;
    private updateCodingStreak;
    private ensurePremiumState;
    private createTransaction;
    private updateAchievementBadges;
    private toSafeUserState;
    getStoreOverview(userId: string): Promise<{
        user: {
            coins: number;
            isPremium: boolean;
            premiumPlan: "monthly" | "yearly" | null;
            premiumExpiresAt: Date | null;
            dailyLoginStreak: number;
            codingStreak: number;
            badges: string[];
            premiumFeatures: string[];
        };
        coinRewards: {
            problem: Record<"Easy" | "Medium" | "Hard", number>;
            activity: Record<ActivityType, number>;
        };
        sections: {
            redeem: RewardItem[];
            premium: RewardItem[];
        };
        achievements: {
            unlocked: boolean;
            id: string;
            title: string;
            description: string;
        }[];
        purchaseHistory: import("../models/StoreTransaction").IStoreTransaction[];
        coinLeaderboard: {
            _id: string;
            username: any;
            fullName: any;
            coins: number;
            isPremium: boolean;
            problemsSolved: number;
        }[];
    }>;
    getPurchaseHistory(userId: string, limit?: number): Promise<import("../models/StoreTransaction").IStoreTransaction[]>;
    redeemItem(userId: string, itemId: string): Promise<{
        message: string;
        coins: number;
        item: RewardItem;
    }>;
    subscribePremium(userId: string, plan: PremiumPlan): Promise<{
        message: string;
        coins: number;
        premiumPlan: "monthly" | "yearly" | undefined;
        premiumExpiresAt: Date | undefined;
        premiumFeatures: string[];
    }>;
    claimDailyLoginReward(userId: string): Promise<{
        message: string;
        streak: number;
        reward: number;
        coins: number;
    }>;
    spinLuckyWheel(userId: string): Promise<{
        message: string;
        reward: number;
        coins: number;
    }>;
    rewardActivity(userId: string, activityType: ActivityType, referenceId: string): Promise<{
        message: string;
        reward: number;
        coins: number;
    }>;
    rewardProblemSolve(userId: string, problemId: string): Promise<{
        awarded: boolean;
        coinsAwarded: number;
    }>;
    recordFailedSubmission(userId: string): Promise<void>;
    getCoinLeaderboard(limit?: number): Promise<{
        _id: string;
        username: any;
        fullName: any;
        coins: number;
        isPremium: boolean;
        problemsSolved: number;
    }[]>;
    getAchievements(userId: string): Promise<{
        unlocked: boolean;
        id: string;
        title: string;
        description: string;
    }[]>;
}
declare const _default: StoreService;
export default _default;
//# sourceMappingURL=storeService.d.ts.map