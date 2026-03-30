import { IContestAdminOverview, IContestAdminView } from '../models/Contest';
declare class ContestService {
    getAdminOverview(): Promise<IContestAdminOverview>;
    getPublicContests(): Promise<{
        contests: IContestAdminView[];
    }>;
}
declare const _default: ContestService;
export default _default;
//# sourceMappingURL=contestService.d.ts.map