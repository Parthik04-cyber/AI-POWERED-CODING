import { Request, Response } from 'express';
export declare const getPosts: (req: Request, res: Response) => Promise<void>;
export declare const getPost: (req: Request, res: Response) => Promise<void>;
export declare const createPost: (req: Request, res: Response) => Promise<void>;
export declare const upvotePost: (req: Request, res: Response) => Promise<void>;
export declare const votePoll: (req: Request, res: Response) => Promise<void>;
export declare const getTrendingTopics: (_req: Request, res: Response) => Promise<void>;
export declare const reportPost: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=discussController.d.ts.map