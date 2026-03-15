"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const getComputedStatus = (row, now) => {
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
const getDurationMinutes = (startsAt, endsAt) => {
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
    async getAdminOverview() {
        const result = await (0, database_1.query)(`
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
      `);
        const now = new Date();
        const contests = result.rows.map((row) => {
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
exports.default = new ContestService();
//# sourceMappingURL=contestService.js.map