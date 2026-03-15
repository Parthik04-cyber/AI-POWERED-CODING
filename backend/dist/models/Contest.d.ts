export type ContestComputedStatus = 'Draft' | 'Scheduled' | 'Live' | 'Completed';
export interface IContest {
    _id: string;
    title: string;
    description?: string;
    status: string;
    rewardCoins: number;
    startsAt?: Date;
    endsAt?: Date;
    participantsTarget: number;
    problemCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface IContestAdminView {
    id: string;
    title: string;
    description?: string;
    status: ContestComputedStatus;
    startsAt?: string;
    endsAt?: string;
    durationMinutes: number;
    participantsTarget: number;
    problemCount: number;
}
export interface IContestAdminOverview {
    totals: {
        plans: number;
        scheduled: number;
        live: number;
    };
    contests: IContestAdminView[];
}
//# sourceMappingURL=Contest.d.ts.map