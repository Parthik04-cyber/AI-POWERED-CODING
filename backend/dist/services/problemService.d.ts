import { IProblem } from '../models/Problem';
declare class ProblemService {
    getAllProblems(skip?: number, limit?: number, difficulty?: string, category?: string): Promise<{
        problems: IProblem[];
        total: number;
        skip: number;
        limit: number;
    }>;
    getProblemById(problemId: string): Promise<IProblem>;
    createProblem(problemData: Partial<IProblem>): Promise<IProblem>;
    updateProblem(problemId: string, updateData: Partial<IProblem>): Promise<IProblem>;
    deleteProblem(problemId: string): Promise<IProblem>;
    incrementSubmissionCount(problemId: string, accepted?: boolean): Promise<void>;
    getCategories(): Promise<string[]>;
    getProblemStats(): Promise<any[]>;
}
declare const _default: ProblemService;
export default _default;
//# sourceMappingURL=problemService.d.ts.map