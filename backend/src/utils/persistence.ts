import { randomUUID } from 'crypto';
import { PoolClient } from 'pg';
import { query } from '../config/database';
import { IUser } from '../models/User';
import { IProblem } from '../models/Problem';
import { ISubmission } from '../models/Submission';
import { IStoreTransaction } from '../models/StoreTransaction';
import { ILeaderboard } from '../models/Leaderboard';

const toDate = (value: unknown): Date | undefined => {
  if (!value) {
    return undefined;
  }

  return value instanceof Date ? value : new Date(String(value));
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry));
  }

  return [];
};

const parseActivityRefs = (rows: Array<{ activity_type: string; reference_id: string }>): string[] =>
  rows.map((row) => `${row.activity_type}:${row.reference_id}`);

export const generateId = (): string => randomUUID();

export const mapUserRow = (
  row: any,
  relations: { solvedProblemIds?: string[]; completedActivityRefs?: string[] } = {},
  includePassword = false
): IUser => ({
  _id: String(row.id),
  username: row.username,
  email: row.email,
  ...(includePassword ? { password: row.password } : {}),
  fullName: row.full_name,
  role: row.role,
  profileImage: row.profile_image || undefined,
  bio: row.bio || undefined,
  problemsSolved: Number(row.problems_solved || 0),
  totalSubmissions: Number(row.total_submissions || 0),
  score: Number(row.score || 0),
  coins: Number(row.coins || 0),
  isPremium: Boolean(row.is_premium),
  premiumPlan: row.premium_plan || undefined,
  premiumExpiresAt: toDate(row.premium_expires_at),
  trialStartedAt: toDate(row.trial_started_at),
  dailyLoginStreak: Number(row.daily_login_streak || 0),
  codingStreak: Number(row.coding_streak || 0),
  lastDailyLoginAt: toDate(row.last_daily_login_at),
  lastSolvedProblemAt: toDate(row.last_solved_problem_at),
  lastLuckySpinAt: toDate(row.last_lucky_spin_at),
  badges: toStringArray(row.badges),
  solvedProblemIds: relations.solvedProblemIds || [],
  completedActivityRefs: relations.completedActivityRefs || [],
  createdAt: toDate(row.created_at) || new Date(),
  updatedAt: toDate(row.updated_at) || new Date(),
});

export const mapProblemRow = (row: any): IProblem => ({
  _id: String(row.id),
  title: row.title,
  description: row.description,
  difficulty: row.difficulty,
  category: row.category,
  tags: toStringArray(row.tags),
  examples: Array.isArray(row.examples) ? row.examples : [],
  constraints: toStringArray(row.constraints),
  testCases: Array.isArray(row.test_cases) ? row.test_cases : [],
  timeLimit: Number(row.time_limit || 0),
  memoryLimit: Number(row.memory_limit || 0),
  submissionCount: Number(row.submission_count || 0),
  acceptedCount: Number(row.accepted_count || 0),
  createdAt: toDate(row.created_at) || new Date(),
  updatedAt: toDate(row.updated_at) || new Date(),
});

export const mapSubmissionRow = (row: any): ISubmission => ({
  _id: String(row.id),
  userId: row.user_ref_id
    ? {
        _id: String(row.user_ref_id),
        username: row.user_ref_username,
        ...(row.user_ref_email ? { email: row.user_ref_email } : {}),
      }
    : String(row.user_id),
  problemId: row.problem_ref_id
    ? {
        _id: String(row.problem_ref_id),
        title: row.problem_ref_title,
        ...(row.problem_ref_difficulty ? { difficulty: row.problem_ref_difficulty } : {}),
      }
    : String(row.problem_id),
  code: row.code,
  language: row.language,
  status: row.status,
  executionTime: Number(row.execution_time || 0),
  memory: Number(row.memory || 0),
  output: row.output || '',
  error: row.error || undefined,
  testsPassed: Number(row.tests_passed || 0),
  totalTests: Number(row.total_tests || 0),
  testCaseResults: row.test_case_results && typeof row.test_case_results === 'string' 
    ? JSON.parse(row.test_case_results)
    : Array.isArray(row.test_case_results) ? row.test_case_results : undefined,
  aiFeedback: row.ai_feedback || undefined,
  createdAt: toDate(row.created_at) || new Date(),
  updatedAt: toDate(row.updated_at) || new Date(),
});

export const mapStoreTransactionRow = (row: any): IStoreTransaction => ({
  _id: String(row.id),
  userId: String(row.user_id),
  type: row.type,
  itemId: row.item_id || undefined,
  title: row.title,
  coinsDelta: Number(row.coins_delta || 0),
  balanceAfter: Number(row.balance_after || 0),
  metadata: row.metadata || {},
  createdAt: toDate(row.created_at) || new Date(),
  updatedAt: toDate(row.updated_at) || new Date(),
});

export const mapLeaderboardRow = (row: any): ILeaderboard => ({
  _id: String(row.id),
  userId: String(row.user_id),
  username: row.username,
  score: Number(row.score || 0),
  problemsSolved: Number(row.problems_solved || 0),
  totalSubmissions: Number(row.total_submissions || 0),
  createdAt: toDate(row.created_at) || new Date(),
  updatedAt: toDate(row.updated_at) || new Date(),
});

const getUserRelations = async (
  userId: string,
  client?: PoolClient
): Promise<{ solvedProblemIds: string[]; completedActivityRefs: string[] }> => {
  const [solvedRows, activityRows] = await Promise.all([
    query<{ problem_id: string }>(
      'SELECT problem_id FROM user_solved_problems WHERE user_id = $1 ORDER BY solved_at ASC',
      [userId],
      client
    ),
    query<{ activity_type: string; reference_id: string }>(
      'SELECT activity_type, reference_id FROM user_completed_activities WHERE user_id = $1 ORDER BY created_at ASC',
      [userId],
      client
    ),
  ]);

  return {
    solvedProblemIds: solvedRows.rows.map((row) => String(row.problem_id)),
    completedActivityRefs: parseActivityRefs(activityRows.rows),
  };
};

export const getUserById = async (
  userId: string,
  options: { includePassword?: boolean; includeRelations?: boolean; client?: PoolClient } = {}
): Promise<IUser | null> => {
  const result = await query<any>('SELECT * FROM users WHERE id = $1', [userId], options.client);
  const row = result.rows[0];

  if (!row) {
    return null;
  }

  const relations = options.includeRelations === false ? { solvedProblemIds: [], completedActivityRefs: [] } : await getUserRelations(userId, options.client);
  return mapUserRow(row, relations, options.includePassword);
};

export const getUserByEmail = async (
  email: string,
  options: { includePassword?: boolean; includeRelations?: boolean; client?: PoolClient } = {}
): Promise<IUser | null> => {
  const result = await query<any>('SELECT * FROM users WHERE email = $1', [email], options.client);
  const row = result.rows[0];

  if (!row) {
    return null;
  }

  const relations = options.includeRelations === false ? { solvedProblemIds: [], completedActivityRefs: [] } : await getUserRelations(String(row.id), options.client);
  return mapUserRow(row, relations, options.includePassword);
};

export const usernameExists = async (username: string, client?: PoolClient): Promise<boolean> => {
  const result = await query('SELECT 1 FROM users WHERE username = $1 LIMIT 1', [username], client);
  return (result.rowCount || 0) > 0;
};

export const emailOrUsernameExists = async (email: string, username: string, client?: PoolClient): Promise<boolean> => {
  const result = await query('SELECT 1 FROM users WHERE email = $1 OR username = $2 LIMIT 1', [email, username], client);
  return (result.rowCount || 0) > 0;
};

export const getAnyAdminUser = async (
  options: { excludeUserId?: string; includePassword?: boolean; client?: PoolClient } = {}
): Promise<IUser | null> => {
  const conditions = ['role = $1'];
  const params: unknown[] = ['admin'];

  if (options.excludeUserId) {
    conditions.push(`id <> $${params.length + 1}`);
    params.push(options.excludeUserId);
  }

  const result = await query<any>(
    `SELECT * FROM users WHERE ${conditions.join(' AND ')} ORDER BY created_at ASC LIMIT 1`,
    params,
    options.client
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return mapUserRow(row, { solvedProblemIds: [], completedActivityRefs: [] }, options.includePassword);
};

const ensureAdminRoleAssignable = async (
  requestedRole: 'user' | 'admin',
  options: { existingUserId?: string; client?: PoolClient } = {}
): Promise<void> => {
  if (requestedRole !== 'admin') {
    return;
  }

  if (!options.existingUserId) {
    const existingAdmin = await getAnyAdminUser({ client: options.client });
    if (existingAdmin) {
      throw new Error('Only one admin account is allowed');
    }
    return;
  }

  const currentRoleResult = await query<{ role: 'user' | 'admin' }>(
    'SELECT role FROM users WHERE id = $1 LIMIT 1',
    [options.existingUserId],
    options.client
  );
  const currentRole = currentRoleResult.rows[0]?.role;

  if (currentRole !== 'admin') {
    const existingAdmin = await getAnyAdminUser({ excludeUserId: options.existingUserId, client: options.client });
    if (existingAdmin) {
      throw new Error('Only one admin account is allowed');
    }
  }
};

export const createUser = async (
  data: Partial<IUser> & { username: string; email: string; password: string; fullName: string; role?: 'user' | 'admin' },
  client?: PoolClient
): Promise<IUser> => {
  const targetRole = data.role || 'user';
  await ensureAdminRoleAssignable(targetRole, { client });

  const userId = data._id || generateId();
  const result = await query<any>(
    `
      INSERT INTO users (
        id, username, email, password, full_name, role, profile_image, bio,
        problems_solved, total_submissions, score, coins, is_premium, premium_plan,
        premium_expires_at, trial_started_at, daily_login_streak, coding_streak, last_daily_login_at,
        last_solved_problem_at, last_lucky_spin_at, badges, created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19,
        $20, $21, $22, NOW(), NOW()
      )
      RETURNING *
    `,
    [
      userId,
      data.username,
      data.email,
      data.password,
      data.fullName,
      targetRole,
      data.profileImage || null,
      data.bio || null,
      data.problemsSolved || 0,
      data.totalSubmissions || 0,
      data.score || 0,
      data.coins || 0,
      data.isPremium || false,
      data.premiumPlan || null,
      data.premiumExpiresAt || null,
      data.trialStartedAt || null,
      data.dailyLoginStreak || 0,
      data.codingStreak || 0,
      data.lastDailyLoginAt || null,
      data.lastSolvedProblemAt || null,
      data.lastLuckySpinAt || null,
      data.badges || [],
    ],
    client
  );

  const created = mapUserRow(result.rows[0], {
    solvedProblemIds: data.solvedProblemIds || [],
    completedActivityRefs: data.completedActivityRefs || [],
  }, true);

  if ((data.solvedProblemIds && data.solvedProblemIds.length) || (data.completedActivityRefs && data.completedActivityRefs.length)) {
    await saveUser(created, client);
    return (await getUserById(userId, { includePassword: true, client })) as IUser;
  }

  return created;
};

export const saveUser = async (user: IUser, client?: PoolClient): Promise<IUser> => {
  await ensureAdminRoleAssignable(user.role, { existingUserId: user._id, client });

  await query(
    `
      UPDATE users
      SET
        username = $2,
        email = $3,
        password = COALESCE($4, password),
        full_name = $5,
        role = $6,
        profile_image = $7,
        bio = $8,
        problems_solved = $9,
        total_submissions = $10,
        score = $11,
        coins = $12,
        is_premium = $13,
        premium_plan = $14,
        premium_expires_at = $15,
        trial_started_at = $16,
        daily_login_streak = $17,
        coding_streak = $18,
        last_daily_login_at = $19,
        last_solved_problem_at = $20,
        last_lucky_spin_at = $21,
        badges = $22,
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      user._id,
      user.username,
      user.email,
      user.password || null,
      user.fullName,
      user.role,
      user.profileImage || null,
      user.bio || null,
      user.problemsSolved || 0,
      user.totalSubmissions || 0,
      user.score || 0,
      user.coins || 0,
      user.isPremium || false,
      user.premiumPlan || null,
      user.premiumExpiresAt || null,
      user.trialStartedAt || null,
      user.dailyLoginStreak || 0,
      user.codingStreak || 0,
      user.lastDailyLoginAt || null,
      user.lastSolvedProblemAt || null,
      user.lastLuckySpinAt || null,
      user.badges || [],
    ],
    client
  );

  await query('DELETE FROM user_solved_problems WHERE user_id = $1', [user._id], client);
  if (user.solvedProblemIds.length > 0) {
    const solvedValues: unknown[] = [];
    const solvedPlaceholders = user.solvedProblemIds
      .map((problemId, index) => {
        const baseIndex = index * 2;
        solvedValues.push(user._id, problemId);
        return `($${baseIndex + 1}, $${baseIndex + 2})`;
      })
      .join(', ');

    await query(
      `INSERT INTO user_solved_problems (user_id, problem_id) VALUES ${solvedPlaceholders} ON CONFLICT (user_id, problem_id) DO NOTHING`,
      solvedValues,
      client
    );
  }

  await query('DELETE FROM user_completed_activities WHERE user_id = $1', [user._id], client);
  if (user.completedActivityRefs.length > 0) {
    const activityValues: unknown[] = [];
    const activityPlaceholders = user.completedActivityRefs
      .map((activityRef, index) => {
        const [activityType, ...referenceParts] = activityRef.split(':');
        const referenceId = referenceParts.join(':');
        const baseIndex = index * 3;
        activityValues.push(user._id, activityType, referenceId);
        return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`;
      })
      .join(', ');

    await query(
      `
        INSERT INTO user_completed_activities (user_id, activity_type, reference_id)
        VALUES ${activityPlaceholders}
        ON CONFLICT (user_id, activity_type, reference_id) DO NOTHING
      `,
      activityValues,
      client
    );
  }

  return (await getUserById(user._id, { includePassword: Boolean(user.password), client })) as IUser;
};