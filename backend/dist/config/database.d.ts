import { PoolClient, QueryResult, QueryResultRow } from 'pg';
export declare const connectDB: () => Promise<void>;
export declare const disconnectDB: () => Promise<void>;
export declare const query: <T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[], client?: PoolClient) => Promise<QueryResult<T>>;
export declare const withTransaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>;
//# sourceMappingURL=database.d.ts.map