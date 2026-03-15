import { ISubmission } from '../models/Submission';
interface Judge0Response {
    status: {
        id: number;
        description: string;
    };
    compile_output?: string;
    runtime_error?: string;
    time?: number;
    memory?: number;
    stdout?: string;
}
interface AnalyticsOverview {
    totalSubmissions: number;
    acceptanceRate: number;
    activeUsers: number;
    averageUserScore: number;
}
interface DifficultyPerformance {
    difficulty: 'Easy' | 'Medium' | 'Hard';
    totalSubmissions: number;
    totalAccepted: number;
    acceptanceRate: number;
}
interface LanguageDistribution {
    language: string;
    count: number;
}
interface DifficultyMix {
    difficulty: 'Easy' | 'Medium' | 'Hard';
    count: number;
}
export interface AdminAnalyticsResponse {
    overview: AnalyticsOverview;
    problemCategoryPerformance: DifficultyPerformance[];
    submissionLanguagesDistribution: LanguageDistribution[];
    difficultyMix: DifficultyMix[];
}
declare class SubmissionService {
    private judge0BaseUrl;
    private judge0ApiKey;
    private openaiClient;
    private getJudge0Headers;
    private getSubmissionSelect;
    executeCode(code: string, language: string, stdin?: string): Promise<Judge0Response>;
    submitCode(userId: string, problemId: string, code: string, language: string): Promise<ISubmission>;
    executeCodeAsync(submissionId: string, code: string, language: string, testCases: any[]): Promise<void>;
    getSubmissionById(submissionId: string): Promise<ISubmission>;
    getUserSubmissions(userId: string, skip?: number, limit?: number): Promise<{
        submissions: ISubmission[];
        total: number;
    }>;
    getProblemSubmissions(problemId: string, skip?: number, limit?: number): Promise<{
        submissions: ISubmission[];
        total: number;
    }>;
    getLeaderboard(limit?: number): Promise<import("../models/Leaderboard").ILeaderboard[]>;
    getAllSubmissions(skip?: number, limit?: number): Promise<{
        submissions: ISubmission[];
        total: number;
    }>;
    getAdminAnalytics(): Promise<AdminAnalyticsResponse>;
    private syncLeaderboardEntry;
    private generateAndAttachAIFeedback;
    private parseJsonSafely;
}
declare const _default: SubmissionService;
export default _default;
//# sourceMappingURL=submissionService.d.ts.map