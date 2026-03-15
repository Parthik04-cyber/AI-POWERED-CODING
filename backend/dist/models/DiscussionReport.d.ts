export type ReportReason = 'spam' | 'harassment' | 'misinformation' | 'nsfw' | 'other';
export type ReportSeverity = 'Low' | 'Medium' | 'High';
export type ModerationStatus = 'Needs review' | 'Escalated' | 'Watching' | 'Resolved';
export type ModerationAction = 'approve' | 'delete_post' | 'warn_user' | 'escalate' | 'dismiss';
export interface IDiscussionPost {
    id: string;
    author: string;
    authorHandle: string;
    avatarColor: string;
    initials: string;
    title: string;
    description: string;
    upvotes: number;
    comments: number;
    views: number;
    timestamp: string;
    category: string;
    tags: string[];
    isUpvoted: boolean;
    type: string;
    poll?: Array<{
        text: string;
        votes: number;
    }>;
    linkedProblem?: string;
    company?: string;
}
export interface ICreateDiscussionPost {
    title: string;
    description: string;
    category: string;
    type?: string;
    tags?: string[];
    linkedProblemId?: string;
    company?: string;
    pollOptions?: string[];
}
export interface IModerationQueueItem {
    id: string;
    discussionId: string;
    title: string;
    category: string;
    reports: number;
    severity: ReportSeverity;
    status: ModerationStatus;
    latestReason: ReportReason;
    latestDetails?: string;
    reporterUsername?: string;
    createdAt: string;
}
export interface IModerationStats {
    queueSize: number;
    escalated: number;
    highSeverity: number;
    resolvedToday: number;
}
export interface IModerationQueueResponse {
    items: IModerationQueueItem[];
    stats: IModerationStats;
    total: number;
}
export interface IModerationActionRecord {
    id: string;
    reportId: string;
    discussionId: string;
    adminUsername: string;
    action: ModerationAction;
    notes?: string;
    createdAt: string;
}
//# sourceMappingURL=DiscussionReport.d.ts.map