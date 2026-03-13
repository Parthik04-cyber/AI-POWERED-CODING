import { PoolClient } from 'pg';
import { IUser } from '../models/User';
import { IProblem } from '../models/Problem';
import { ISubmission } from '../models/Submission';
import { IStoreTransaction } from '../models/StoreTransaction';
import { ILeaderboard } from '../models/Leaderboard';
export declare const generateId: () => string;
export declare const mapUserRow: (row: any, relations?: {
    solvedProblemIds?: string[];
    completedActivityRefs?: string[];
}, includePassword?: boolean) => IUser;
export declare const mapProblemRow: (row: any) => IProblem;
export declare const mapSubmissionRow: (row: any) => ISubmission;
export declare const mapStoreTransactionRow: (row: any) => IStoreTransaction;
export declare const mapLeaderboardRow: (row: any) => ILeaderboard;
export declare const getUserById: (userId: string, options?: {
    includePassword?: boolean;
    includeRelations?: boolean;
    client?: PoolClient;
}) => Promise<IUser | null>;
export declare const getUserByEmail: (email: string, options?: {
    includePassword?: boolean;
    includeRelations?: boolean;
    client?: PoolClient;
}) => Promise<IUser | null>;
export declare const usernameExists: (username: string, client?: PoolClient) => Promise<boolean>;
export declare const emailOrUsernameExists: (email: string, username: string, client?: PoolClient) => Promise<boolean>;
export declare const createUser: (data: Partial<IUser> & {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role?: "user" | "admin";
}, client?: PoolClient) => Promise<IUser>;
export declare const saveUser: (user: IUser, client?: PoolClient) => Promise<IUser>;
//# sourceMappingURL=persistence.d.ts.map