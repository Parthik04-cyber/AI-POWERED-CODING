"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTransaction = exports.query = exports.disconnectDB = exports.connectDB = void 0;
const pg_1 = require("pg");
let pool = null;
const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/codemaster';
const LEGACY_ARCHIVE_SUFFIX = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const getDatabaseUrl = () => process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
const getSafeDatabaseTarget = () => {
    try {
        const parsed = new URL(getDatabaseUrl());
        if (parsed.password) {
            parsed.password = '***';
        }
        return parsed.toString();
    }
    catch (_error) {
        return '<invalid DATABASE_URL>';
    }
};
const getPool = () => {
    if (!pool) {
        pool = new pg_1.Pool({
            connectionString: getDatabaseUrl(),
        });
    }
    return pool;
};
const getTableColumns = async (tableName) => {
    const result = await getPool().query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
    `, [tableName]);
    return new Map(result.rows.map((row) => [row.column_name, row.data_type]));
};
const archiveLegacyTablesIfNeeded = async () => {
    const compatibilityRules = [
        {
            tableName: 'users',
            requiredColumns: [
                { name: 'id', type: 'text' },
                { name: 'full_name', type: 'text' },
                { name: 'badges', type: 'ARRAY' },
            ],
        },
        {
            tableName: 'problems',
            requiredColumns: [
                { name: 'id', type: 'text' },
                { name: 'category', type: 'text' },
                { name: 'test_cases', type: 'jsonb' },
            ],
            archiveWith: ['test_cases'],
        },
        {
            tableName: 'submissions',
            requiredColumns: [
                { name: 'id', type: 'text' },
                { name: 'user_id', type: 'text' },
                { name: 'problem_id', type: 'text' },
                { name: 'ai_feedback', type: 'jsonb' },
            ],
        },
        {
            tableName: 'leaderboard',
            requiredColumns: [
                { name: 'id', type: 'text' },
                { name: 'user_id', type: 'text' },
            ],
        },
        {
            tableName: 'store_transactions',
            requiredColumns: [
                { name: 'id', type: 'text' },
                { name: 'user_id', type: 'text' },
                { name: 'metadata', type: 'jsonb' },
            ],
        },
        {
            tableName: 'store_catalog_items',
            requiredColumns: [
                { name: 'id', type: 'text' },
                { name: 'title', type: 'text' },
                { name: 'section', type: 'text' },
            ],
        },
        {
            tableName: 'user_solved_problems',
            requiredColumns: [
                { name: 'user_id', type: 'text' },
                { name: 'problem_id', type: 'text' },
            ],
        },
        {
            tableName: 'user_completed_activities',
            requiredColumns: [
                { name: 'user_id', type: 'text' },
                { name: 'activity_type', type: 'text' },
                { name: 'reference_id', type: 'text' },
            ],
        },
    ];
    for (const rule of compatibilityRules) {
        const columns = await getTableColumns(rule.tableName);
        if (columns.size === 0) {
            continue;
        }
        const incompatible = rule.requiredColumns.some(({ name, type }) => {
            if (!columns.has(name)) {
                return true;
            }
            if (!type) {
                return false;
            }
            const actualType = columns.get(name);
            if (type === 'ARRAY') {
                return actualType !== 'ARRAY';
            }
            return actualType !== type;
        });
        if (!incompatible) {
            continue;
        }
        const tablesToArchive = [rule.tableName, ...(rule.archiveWith || [])];
        for (const tableName of tablesToArchive) {
            const tableColumns = await getTableColumns(tableName);
            if (tableColumns.size === 0) {
                continue;
            }
            const archivedName = `${tableName}_legacy_${LEGACY_ARCHIVE_SUFFIX}`;
            await getPool().query(`ALTER TABLE ${tableName} RENAME TO ${archivedName}`);
            console.log(`! Archived incompatible legacy table ${tableName} -> ${archivedName}`);
        }
    }
};
const initializeSchema = async () => {
    await archiveLegacyTablesIfNeeded();
    const schemaStatements = [
        `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        profile_image TEXT,
        bio TEXT,
        problems_solved INTEGER NOT NULL DEFAULT 0,
        total_submissions INTEGER NOT NULL DEFAULT 0,
        score INTEGER NOT NULL DEFAULT 0,
        coins INTEGER NOT NULL DEFAULT 0,
        is_premium BOOLEAN NOT NULL DEFAULT FALSE,
        premium_plan TEXT CHECK (premium_plan IN ('monthly', 'yearly')),
        premium_expires_at TIMESTAMPTZ,
        daily_login_streak INTEGER NOT NULL DEFAULT 0,
        coding_streak INTEGER NOT NULL DEFAULT 0,
        last_daily_login_at TIMESTAMPTZ,
        last_solved_problem_at TIMESTAMPTZ,
        last_lucky_spin_at TIMESTAMPTZ,
        badges TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
        `
      CREATE TABLE IF NOT EXISTS problems (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
        category TEXT NOT NULL,
        tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        examples JSONB NOT NULL DEFAULT '[]'::JSONB,
        constraints TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        test_cases JSONB NOT NULL DEFAULT '[]'::JSONB,
        time_limit INTEGER NOT NULL DEFAULT 5,
        memory_limit INTEGER NOT NULL DEFAULT 256,
        submission_count INTEGER NOT NULL DEFAULT 0,
        accepted_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
        `
      CREATE TABLE IF NOT EXISTS user_solved_problems (
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
        solved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, problem_id)
      )
    `,
        `
      CREATE TABLE IF NOT EXISTS user_completed_activities (
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_type TEXT NOT NULL,
        reference_id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, activity_type, reference_id)
      )
    `,
        `
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        language TEXT NOT NULL CHECK (language IN ('javascript', 'python', 'java', 'cpp')),
        status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('SUCCESS', 'COMPILE_ERROR', 'RUNTIME_ERROR', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'WRONG_ANSWER', 'PENDING')),
        execution_time DOUBLE PRECISION NOT NULL DEFAULT 0,
        memory INTEGER NOT NULL DEFAULT 0,
        output TEXT NOT NULL DEFAULT '',
        error TEXT,
        tests_passed INTEGER NOT NULL DEFAULT 0,
        total_tests INTEGER NOT NULL DEFAULT 0,
        ai_feedback JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
        `
      CREATE TABLE IF NOT EXISTS leaderboard (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        username TEXT NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        problems_solved INTEGER NOT NULL DEFAULT 0,
        total_submissions INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
        `
      CREATE TABLE IF NOT EXISTS store_transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('problem_solve', 'daily_login', 'lucky_spin', 'redeem', 'premium_purchase', 'contest_reward', 'interview_reward')),
        item_id TEXT,
        title TEXT NOT NULL,
        coins_delta INTEGER NOT NULL,
        balance_after INTEGER NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
        `
      CREATE TABLE IF NOT EXISTS store_catalog_items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        cost INTEGER NOT NULL CHECK (cost >= 0),
        section TEXT NOT NULL CHECK (section IN ('redeem', 'premium')),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
        `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
        `
      CREATE TABLE IF NOT EXISTS contests (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        reward_coins INTEGER NOT NULL DEFAULT 0,
        participants_target INTEGER NOT NULL DEFAULT 0,
        problem_count INTEGER NOT NULL DEFAULT 0,
        starts_at TIMESTAMPTZ,
        ends_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
        `
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        track TEXT,
        difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
        estimated_time TEXT,
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
        lessons JSONB NOT NULL DEFAULT '[]'::JSONB,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
        `ALTER TABLE contests ADD COLUMN IF NOT EXISTS participants_target INTEGER NOT NULL DEFAULT 0`,
        `ALTER TABLE contests ADD COLUMN IF NOT EXISTS problem_count INTEGER NOT NULL DEFAULT 0`,
        `
      CREATE TABLE IF NOT EXISTS discussions (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        linked_problem_id TEXT REFERENCES problems(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        type TEXT,
        company TEXT,
        tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        poll_options TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        upvotes INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
        'CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems(created_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category)',
        'CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty)',
        'CREATE INDEX IF NOT EXISTS idx_submissions_user_problem ON submissions(user_id, problem_id)',
        'CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC, problems_solved DESC)',
        'CREATE INDEX IF NOT EXISTS idx_store_transactions_user_created_at ON store_transactions(user_id, created_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_store_catalog_items_section_active ON store_catalog_items(section, is_active)',
        'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id, created_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)',
        'CREATE INDEX IF NOT EXISTS idx_contests_starts_at ON contests(starts_at)',
        'CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status)',
        'CREATE INDEX IF NOT EXISTS idx_courses_status_updated_at ON courses(status, updated_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_courses_updated_at ON courses(updated_at DESC)',
        // ── Discussion extra columns ──────────────────────────────────────────────
        `ALTER TABLE discussions ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0`,
        `ALTER TABLE discussions ADD COLUMN IF NOT EXISTS comment_count INTEGER NOT NULL DEFAULT 0`,
        `ALTER TABLE discussions ADD COLUMN IF NOT EXISTS report_count INTEGER NOT NULL DEFAULT 0`,
        `ALTER TABLE discussions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE discussions ADD COLUMN IF NOT EXISTS poll_votes JSONB NOT NULL DEFAULT '{}'::JSONB`,
        // ── Discussion upvotes ────────────────────────────────────────────────────
        `
      CREATE TABLE IF NOT EXISTS discussion_upvotes (
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        discussion_id TEXT NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, discussion_id)
      )
    `,
        // ── Discussion reports ────────────────────────────────────────────────────
        `
      CREATE TABLE IF NOT EXISTS discussion_reports (
        id TEXT PRIMARY KEY,
        discussion_id TEXT NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
        reporter_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        reporter_username TEXT,
        reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'misinformation', 'nsfw', 'other')),
        details TEXT,
        severity TEXT NOT NULL DEFAULT 'Low' CHECK (severity IN ('Low', 'Medium', 'High')),
        moderation_status TEXT NOT NULL DEFAULT 'Needs review' CHECK (moderation_status IN ('Needs review', 'Escalated', 'Watching', 'Resolved')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
        // ── Discussion moderation actions ─────────────────────────────────────────
        `
      CREATE TABLE IF NOT EXISTS discussion_moderation_actions (
        id TEXT PRIMARY KEY,
        report_id TEXT NOT NULL REFERENCES discussion_reports(id) ON DELETE CASCADE,
        discussion_id TEXT NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
        admin_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        admin_username TEXT NOT NULL,
        action TEXT NOT NULL CHECK (action IN ('approve', 'delete_post', 'warn_user', 'escalate', 'dismiss')),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
        // ── Indexes ───────────────────────────────────────────────────────────────
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_discussion_reports_unique_reporter
       ON discussion_reports(discussion_id, reporter_id) WHERE reporter_id IS NOT NULL`,
        `CREATE INDEX IF NOT EXISTS idx_discussion_reports_status ON discussion_reports(moderation_status)`,
        `CREATE INDEX IF NOT EXISTS idx_discussion_reports_discussion ON discussion_reports(discussion_id)`,
        `CREATE INDEX IF NOT EXISTS idx_discussions_created ON discussions(created_at DESC)`,
        `CREATE INDEX IF NOT EXISTS idx_discussions_category ON discussions(category)`,
    ];
    for (const statement of schemaStatements) {
        await getPool().query(statement);
    }
};
const connectDB = async () => {
    try {
        const instance = getPool();
        await instance.query('SELECT 1');
        await initializeSchema();
        console.log('✓ PostgreSQL connected successfully');
    }
    catch (error) {
        const pgError = error;
        if (pgError.code === '28P01') {
            console.error(`✗ PostgreSQL connection failed: password authentication failed. Check DATABASE_URL in backend/.env and make sure the username/password match your PostgreSQL instance. Current target: ${getSafeDatabaseTarget()}`);
        }
        else {
            console.error('✗ PostgreSQL connection failed:', error);
        }
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    if (!pool) {
        return;
    }
    try {
        await pool.end();
        pool = null;
        console.log('✓ PostgreSQL disconnected');
    }
    catch (error) {
        console.error('✗ PostgreSQL disconnection failed:', error);
    }
};
exports.disconnectDB = disconnectDB;
const query = async (text, params = [], client) => {
    const executor = client || getPool();
    return executor.query(text, params);
};
exports.query = query;
const withTransaction = async (callback) => {
    const client = await getPool().connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.withTransaction = withTransaction;
//# sourceMappingURL=database.js.map