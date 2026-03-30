import { TransactionType } from '../models/StoreTransaction';
type ActivityType = 'contest' | 'interview';
type StoreSection = 'redeem' | 'premium';
interface StoreCatalogItem {
    id: string;
    title: string;
    description: string;
    cost: number;
    section: StoreSection;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class StoreService {
    private mapCatalogRow;
    private sanitizeCatalogInput;
    private buildCatalogId;
    private ensureCatalogSeed;
    private getCatalogItems;
    private getCatalogItemById;
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
            trialStartedAt: Date | null;
            trialEndsAt: Date | null;
            hasActiveAccess: boolean;
            accessStatus: import("./accessService").AccessStatus;
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
            redeem: StoreCatalogItem[];
            premium: StoreCatalogItem[];
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
        item: StoreCatalogItem;
    }>;
    subscribePremium(userId: string): Promise<{
        message: string;
        coins: number;
        premiumPlan: "monthly" | "yearly" | undefined;
        premiumExpiresAt: Date | undefined;
        amountInr: number;
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
    getAdminOverview(limit?: number): Promise<{
        catalogItems: StoreCatalogItem[];
        recentTransactions: {
            username: any;
            fullName: any;
            _id: string;
            userId: string;
            type: TransactionType;
            itemId?: string;
            title: string;
            coinsDelta: number;
            balanceAfter: number;
            metadata?: Record<string, unknown>;
            createdAt: Date;
            updatedAt: Date;
        }[];
        coinLeaderboard: {
            _id: string;
            username: any;
            fullName: any;
            coins: number;
            isPremium: boolean;
            problemsSolved: number;
        }[];
    }>;
    createCatalogItem(input: {
        title: string;
        description: string;
        cost: number;
        section: StoreSection;
    }): Promise<StoreCatalogItem>;
    updateCatalogItem(itemId: string, input: Partial<{
        title: string;
        description: string;
        cost: number;
        section: StoreSection;
        isActive: boolean;
    }>): Promise<StoreCatalogItem>;
    removeCatalogItem(itemId: string): Promise<{
        message: string;
    }>;
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