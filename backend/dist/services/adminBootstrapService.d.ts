interface EnsureAdminResult {
    created: boolean;
    updated: boolean;
    email: string;
    username: string;
}
export declare const ensureDefaultAdminAccount: () => Promise<EnsureAdminResult>;
export {};
//# sourceMappingURL=adminBootstrapService.d.ts.map