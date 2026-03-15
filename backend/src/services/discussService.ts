import { randomUUID } from 'crypto';
import { query, withTransaction } from '../config/database';
import { IDiscussionPost, ICreateDiscussionPost } from '../models/DiscussionReport';

type DiscussionRow = {
  id: string;
  user_id: string | null;
  linked_problem_id: string | null;
  title: string;
  description: string;
  category: string;
  type: string | null;
  company: string | null;
  tags: string[];
  poll_options: string[];
  poll_votes: Record<string, number>;
  upvotes: number;
  view_count: number;
  comment_count: number;
  created_at: Date | string;
  author_username: string | null;
  author_full_name: string | null;
  is_upvoted: boolean;
};

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-pink-500',
  'bg-amber-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500',
  'bg-cyan-500', 'bg-orange-500',
];

const getAvatarColor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getRelativeTime = (date: Date | string): string => {
  const d = date instanceof Date ? date : new Date(date);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
};

const mapRow = (row: DiscussionRow): IDiscussionPost => {
  const handle = row.author_username || 'anonymous';
  const displayName = row.author_full_name || row.author_username || 'Anonymous';
  const initials = displayName.slice(0, 2).toUpperCase();
  const pollVotes: Record<string, number> = row.poll_votes || {};
  const poll =
    row.poll_options && row.poll_options.length > 0
      ? row.poll_options.map((text, i) => ({ text, votes: pollVotes[String(i)] || 0 }))
      : undefined;

  return {
    id: row.id,
    author: displayName,
    authorHandle: handle,
    avatarColor: getAvatarColor(handle),
    initials,
    title: row.title,
    description: row.description,
    upvotes: Number(row.upvotes) || 0,
    comments: Number(row.comment_count) || 0,
    views: Number(row.view_count) || 0,
    timestamp: getRelativeTime(row.created_at),
    category: row.category,
    tags: Array.isArray(row.tags) ? row.tags : [],
    isUpvoted: Boolean(row.is_upvoted),
    type: row.type || 'discussion',
    poll,
    linkedProblem: row.linked_problem_id || undefined,
    company: row.company || undefined,
  };
};

const SELECT_FIELDS = `
  d.id, d.user_id, d.linked_problem_id, d.title, d.description,
  d.category, d.type, d.company, d.tags, d.poll_options, d.poll_votes,
  d.upvotes, d.view_count, d.comment_count, d.created_at,
  u.username as author_username, u.full_name as author_full_name
`;

class DiscussService {
  async getPosts(params: {
    category?: string;
    skip?: number;
    limit?: number;
    userId?: string;
  }): Promise<{ posts: IDiscussionPost[]; total: number }> {
    const { category, skip = 0, limit = 20, userId } = params;

    const conditions: string[] = ['d.is_deleted = FALSE'];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (category && category !== 'For You') {
      conditions.push(`d.category = $${paramIndex++}`);
      queryParams.push(category);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM discussions d ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0]?.count || '0', 10);

    // Build upvote join
    let upvoteJoin = '';
    let isUpvotedExpr = 'FALSE';
    if (userId) {
      upvoteJoin = `LEFT JOIN discussion_upvotes du ON du.discussion_id = d.id AND du.user_id = $${paramIndex++}`;
      queryParams.push(userId);
      isUpvotedExpr = 'CASE WHEN du.user_id IS NOT NULL THEN TRUE ELSE FALSE END';
    }

    const offsetIdx = paramIndex++;
    const limitIdx = paramIndex;
    queryParams.push(skip, limit);

    const result = await query<DiscussionRow>(
      `
        SELECT ${SELECT_FIELDS}, ${isUpvotedExpr} as is_upvoted
        FROM discussions d
        LEFT JOIN users u ON u.id = d.user_id
        ${upvoteJoin}
        ${whereClause}
        ORDER BY d.created_at DESC
        OFFSET $${offsetIdx} LIMIT $${limitIdx}
      `,
      queryParams
    );

    return { posts: result.rows.map(mapRow), total };
  }

  async getPost(id: string, userId?: string): Promise<IDiscussionPost | null> {
    const params: unknown[] = [id];
    let upvoteJoin = '';
    let isUpvotedExpr = 'FALSE';
    if (userId) {
      upvoteJoin = `LEFT JOIN discussion_upvotes du ON du.discussion_id = d.id AND du.user_id = $2`;
      params.push(userId);
      isUpvotedExpr = 'CASE WHEN du.user_id IS NOT NULL THEN TRUE ELSE FALSE END';
    }

    const result = await query<DiscussionRow>(
      `
        SELECT ${SELECT_FIELDS}, ${isUpvotedExpr} as is_upvoted
        FROM discussions d
        LEFT JOIN users u ON u.id = d.user_id
        ${upvoteJoin}
        WHERE d.id = $1 AND d.is_deleted = FALSE
      `,
      params
    );

    if (result.rows.length === 0) return null;
    return mapRow(result.rows[0]);
  }

  async createPost(userId: string, data: ICreateDiscussionPost): Promise<IDiscussionPost> {
    const id = randomUUID();
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const pollOptions = Array.isArray(data.pollOptions) ? data.pollOptions.filter(Boolean) : [];

    await query(
      `
        INSERT INTO discussions
          (id, user_id, linked_problem_id, title, description, category, type, company, tags, poll_options, poll_votes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, '{}')
      `,
      [
        id,
        userId,
        data.linkedProblemId || null,
        data.title,
        data.description,
        data.category,
        data.type || 'discussion',
        data.company || null,
        tags,
        pollOptions,
      ]
    );

    const post = await this.getPost(id, userId);
    if (!post) throw new Error('Failed to retrieve created post');
    return post;
  }

  async toggleUpvote(
    discussionId: string,
    userId: string
  ): Promise<{ upvotes: number; isUpvoted: boolean }> {
    return withTransaction(async (client) => {
      const existing = await client.query(
        'SELECT 1 FROM discussion_upvotes WHERE user_id = $1 AND discussion_id = $2',
        [userId, discussionId]
      );

      if (existing.rows.length > 0) {
        await client.query(
          'DELETE FROM discussion_upvotes WHERE user_id = $1 AND discussion_id = $2',
          [userId, discussionId]
        );
        const res = await client.query<{ upvotes: number }>(
          'UPDATE discussions SET upvotes = GREATEST(0, upvotes - 1) WHERE id = $1 RETURNING upvotes',
          [discussionId]
        );
        return { upvotes: Number(res.rows[0]?.upvotes ?? 0), isUpvoted: false };
      }

      await client.query(
        'INSERT INTO discussion_upvotes (user_id, discussion_id) VALUES ($1, $2)',
        [userId, discussionId]
      );
      const res = await client.query<{ upvotes: number }>(
        'UPDATE discussions SET upvotes = upvotes + 1 WHERE id = $1 RETURNING upvotes',
        [discussionId]
      );
      return { upvotes: Number(res.rows[0]?.upvotes ?? 0), isUpvoted: true };
    });
  }

  async votePoll(
    discussionId: string,
    optionIndex: number
  ): Promise<{ votes: Record<string, number> }> {
    const result = await query<{
      poll_options: string[];
      poll_votes: Record<string, number>;
    }>('SELECT poll_options, poll_votes FROM discussions WHERE id = $1 AND is_deleted = FALSE', [
      discussionId,
    ]);

    if (result.rows.length === 0) throw new Error('Discussion not found');

    const { poll_options, poll_votes } = result.rows[0];
    if (!poll_options || optionIndex < 0 || optionIndex >= poll_options.length) {
      throw new Error('Invalid poll option index');
    }

    const votes: Record<string, number> = poll_votes || {};
    const key = String(optionIndex);
    votes[key] = (votes[key] || 0) + 1;

    await query('UPDATE discussions SET poll_votes = $1 WHERE id = $2', [
      votes,
      discussionId,
    ]);

    return { votes };
  }

  async getTrendingTopics(): Promise<Array<{ tag: string; posts: number }>> {
    const result = await query<{ tag: string; count: string }>(
      `
        SELECT unnest(tags) as tag, COUNT(*) as count
        FROM discussions
        WHERE is_deleted = FALSE
          AND created_at > NOW() - INTERVAL '30 days'
        GROUP BY tag
        ORDER BY count DESC
        LIMIT 10
      `
    );

    return result.rows.map((row) => ({
      tag: row.tag,
      posts: parseInt(row.count, 10),
    }));
  }

  async incrementViews(id: string): Promise<void> {
    await query(
      'UPDATE discussions SET view_count = view_count + 1 WHERE id = $1',
      [id]
    );
  }
}

export default new DiscussService();
