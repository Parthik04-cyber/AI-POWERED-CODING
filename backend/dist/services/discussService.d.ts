import { IDiscussionPost, ICreateDiscussionPost } from '../models/DiscussionReport';
declare class DiscussService {
    getPosts(params: {
        category?: string;
        skip?: number;
        limit?: number;
        userId?: string;
    }): Promise<{
        posts: IDiscussionPost[];
        total: number;
    }>;
    getPost(id: string, userId?: string): Promise<IDiscussionPost | null>;
    createPost(userId: string, data: ICreateDiscussionPost): Promise<IDiscussionPost>;
    toggleUpvote(discussionId: string, userId: string): Promise<{
        upvotes: number;
        isUpvoted: boolean;
    }>;
    votePoll(discussionId: string, optionIndex: number): Promise<{
        votes: Record<string, number>;
    }>;
    getTrendingTopics(): Promise<Array<{
        tag: string;
        posts: number;
    }>>;
    incrementViews(id: string): Promise<void>;
}
declare const _default: DiscussService;
export default _default;
//# sourceMappingURL=discussService.d.ts.map