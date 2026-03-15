import { query } from '../config/database';
import { IContestAdminOverview, IContestAdminView, ContestComputedStatus } from '../models/Contest';

type ContestRow = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  starts_at: Date | string | null;
  ends_at: Date | string | null;
  participants_target: number | string | null;
  problem_count: number | string | null;
};

const getComputedStatus = (row: ContestRow, now: Date): ContestComputedStatus => {
  const startsAt = row.starts_at ? new Date(row.starts_at) : null;
  const endsAt = row.ends_at ? new Date(row.ends_at) : null;
  const normalizedStatus = (row.status || '').toLowerCase().trim();

  if (startsAt && endsAt && now >= startsAt && now < endsAt) {
    return 'Live';
  }

  if (startsAt && now < startsAt) {
    return 'Scheduled';
  }

  if (normalizedStatus === 'live') {
    return 'Live';
  }

  if (normalizedStatus === 'scheduled') {
    return 'Scheduled';
  }

  if (normalizedStatus === 'completed') {
    return 'Completed';
  }

  return 'Draft';
};

const getDurationMinutes = (startsAt?: Date, endsAt?: Date): number => {
  if (!startsAt || !endsAt) {
    return 0;
  }

  const ms = endsAt.getTime() - startsAt.getTime();
  if (ms <= 0) {
    return 0;
  }

  return Math.round(ms / (1000 * 60));
};

class ContestService {
  async getAdminOverview(): Promise<IContestAdminOverview> {
    const result = await query<ContestRow>(
      `
        SELECT
          id,
          title,
          description,
          status,
          starts_at,
          ends_at,
          participants_target,
          problem_count
        FROM contests
        ORDER BY starts_at ASC NULLS LAST, created_at DESC
      `
    );

    const now = new Date();
    const contests: IContestAdminView[] = result.rows.map((row) => {
      const startsAt = row.starts_at ? new Date(row.starts_at) : undefined;
      const endsAt = row.ends_at ? new Date(row.ends_at) : undefined;

      return {
        id: String(row.id),
        title: row.title,
        description: row.description || undefined,
        status: getComputedStatus(row, now),
        startsAt: startsAt?.toISOString(),
        endsAt: endsAt?.toISOString(),
        durationMinutes: getDurationMinutes(startsAt, endsAt),
        participantsTarget: Number(row.participants_target || 0),
        problemCount: Number(row.problem_count || 0),
      };
    });

    const scheduled = contests.filter((contest) => contest.status === 'Scheduled').length;
    const live = contests.filter((contest) => contest.status === 'Live').length;

    return {
      totals: {
        plans: contests.length,
        scheduled,
        live,
      },
      contests,
    };
  }
}

export default new ContestService();
