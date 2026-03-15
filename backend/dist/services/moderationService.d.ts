import { IModerationStats, IModerationQueueResponse, IModerationActionRecord, ReportReason, ModerationStatus, ModerationAction } from '../models/DiscussionReport';
declare class ModerationService {
    submitReport(data: {
        discussionId: string;
        reporterId: string;
        reason: ReportReason;
        details?: string;
    }): Promise<void>;
    getModerationStats(): Promise<IModerationStats>;
    getModerationQueue(params: {
        skip?: number;
        limit?: number;
        status?: ModerationStatus;
    }): Promise<IModerationQueueResponse>;
    takeAction(data: {
        reportId: string;
        discussionId: string;
        adminId: string;
        action: ModerationAction;
        notes?: string;
    }): Promise<void>;
    getActionHistory(reportId: string): Promise<IModerationActionRecord[]>;
}
declare const _default: ModerationService;
export default _default;
//# sourceMappingURL=moderationService.d.ts.map