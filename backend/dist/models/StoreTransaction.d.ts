export type TransactionType = 'problem_solve' | 'daily_login' | 'lucky_spin' | 'redeem' | 'premium_purchase' | 'contest_reward' | 'interview_reward';
export interface IStoreTransaction {
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
}
//# sourceMappingURL=StoreTransaction.d.ts.map