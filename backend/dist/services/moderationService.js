"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const database_1 = require("../config/database");
const VALID_REASONS = ['spam', 'harassment', 'misinformation', 'nsfw', 'other'];
const VALID_ACTIONS = ['approve', 'delete_post', 'warn_user', 'escalate', 'dismiss'];
const getSeverityFromReason = (reason) => {
    if (reason === 'harassment' || reason === 'nsfw')
        return 'High';
    if (reason === 'misinformation')
        return 'Medium';
    return 'Low';
};
class ModerationService {
    async submitReport(data) {
        const { discussionId, reporterId, reason, details } = data;
        if (!VALID_REASONS.includes(reason)) {
            throw new Error('Invalid report reason');
        }
        const discussionRow = await (0, database_1.query)('SELECT id FROM discussions WHERE id = $1 AND is_deleted = FALSE', [discussionId]);
        if (discussionRow.rows.length === 0) {
            throw new Error('Discussion not found');
        }
        // Prevent duplicate reports from the same user
        const existing = await (0, database_1.query)('SELECT id FROM discussion_reports WHERE discussion_id = $1 AND reporter_id = $2', [discussionId, reporterId]);
        if (existing.rows.length > 0) {
            throw new Error('You have already reported this post');
        }
        const reporterRow = await (0, database_1.query)('SELECT username FROM users WHERE id = $1', [reporterId]);
        const reporterUsername = reporterRow.rows[0]?.username || 'unknown';
        const severity = getSeverityFromReason(reason);
        const id = (0, crypto_1.randomUUID)();
        await (0, database_1.withTransaction)(async (client) => {
            await client.query(`
          INSERT INTO discussion_reports
            (id, discussion_id, reporter_id, reporter_username, reason, details, severity)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [id, discussionId, reporterId, reporterUsername, reason, details || null, severity]);
            await client.query(`UPDATE discussions
           SET report_count = (
             SELECT COUNT(*) FROM discussion_reports WHERE discussion_id = $1
           )
         WHERE id = $1`, [discussionId]);
        });
    }
    async getModerationStats() {
        const [queueRes, escalatedRes, highRes, resolvedRes] = await Promise.all([
            (0, database_1.query)(`SELECT COUNT(DISTINCT discussion_id) AS count
           FROM discussion_reports
          WHERE moderation_status NOT IN ('Resolved')`),
            (0, database_1.query)(`SELECT COUNT(DISTINCT discussion_id) AS count
           FROM discussion_reports
          WHERE moderation_status = 'Escalated'`),
            (0, database_1.query)(`SELECT COUNT(DISTINCT discussion_id) AS count
           FROM discussion_reports
          WHERE severity = 'High' AND moderation_status NOT IN ('Resolved')`),
            (0, database_1.query)(`SELECT COUNT(*) AS count
           FROM discussion_moderation_actions
          WHERE created_at >= NOW() - INTERVAL '24 hours'`),
        ]);
        return {
            queueSize: parseInt(queueRes.rows[0]?.count || '0', 10),
            escalated: parseInt(escalatedRes.rows[0]?.count || '0', 10),
            highSeverity: parseInt(highRes.rows[0]?.count || '0', 10),
            resolvedToday: parseInt(resolvedRes.rows[0]?.count || '0', 10),
        };
    }
    async getModerationQueue(params) {
        const { skip = 0, limit = 20, status } = params;
        const queryParams = [];
        let paramIdx = 1;
        let statusFilter;
        if (status) {
            statusFilter = `moderation_status = $${paramIdx++}`;
            queryParams.push(status);
        }
        else {
            statusFilter = `moderation_status NOT IN ('Resolved')`;
        }
        const offsetIdx = paramIdx++;
        const limitIdx = paramIdx;
        queryParams.push(skip, limit);
        const result = await (0, database_1.query)(`
        WITH filtered AS (
          SELECT * FROM discussion_reports WHERE ${statusFilter}
        ),
        report_stats AS (
          SELECT
            discussion_id,
            COUNT(*) AS reports,
            MAX(CASE severity WHEN 'High' THEN 3 WHEN 'Medium' THEN 2 ELSE 1 END) AS max_severity_num,
            CASE MAX(CASE moderation_status WHEN 'Escalated' THEN 2 WHEN 'Needs review' THEN 1 ELSE 0 END)
              WHEN 2 THEN 'Escalated'
              WHEN 1 THEN 'Needs review'
              ELSE 'Watching'
            END AS worst_status,
            MIN(created_at) AS oldest_report_at
          FROM filtered
          GROUP BY discussion_id
        ),
        latest_report AS (
          SELECT DISTINCT ON (discussion_id)
            id, discussion_id, reason, details, reporter_username, created_at
          FROM filtered
          ORDER BY discussion_id, created_at DESC
        )
        SELECT
          lr.id,
          rs.discussion_id,
          d.title,
          d.category,
          rs.reports,
          rs.max_severity_num,
          rs.worst_status,
          lr.reason AS latest_reason,
          lr.details AS latest_details,
          lr.reporter_username,
          rs.oldest_report_at AS created_at
        FROM report_stats rs
        JOIN discussions d ON d.id = rs.discussion_id
        JOIN latest_report lr ON lr.discussion_id = rs.discussion_id
        WHERE d.is_deleted = FALSE
        ORDER BY rs.max_severity_num DESC, rs.reports DESC, rs.oldest_report_at ASC
        OFFSET $${offsetIdx} LIMIT $${limitIdx}
      `, queryParams);
        const items = result.rows.map((row) => {
            const severityNum = parseInt(String(row.max_severity_num), 10);
            const severity = severityNum === 3 ? 'High' : severityNum === 2 ? 'Medium' : 'Low';
            return {
                id: row.id,
                discussionId: row.discussion_id,
                title: row.title,
                category: row.category,
                reports: parseInt(String(row.reports), 10),
                severity,
                status: row.worst_status,
                latestReason: row.latest_reason,
                latestDetails: row.latest_details || undefined,
                reporterUsername: row.reporter_username || undefined,
                createdAt: row.created_at instanceof Date
                    ? row.created_at.toISOString()
                    : String(row.created_at),
            };
        });
        const stats = await this.getModerationStats();
        return { items, stats, total: items.length };
    }
    async takeAction(data) {
        const { reportId, discussionId, adminId, action, notes } = data;
        if (!VALID_ACTIONS.includes(action)) {
            throw new Error('Invalid moderation action');
        }
        const adminRow = await (0, database_1.query)('SELECT username FROM users WHERE id = $1', [adminId]);
        const adminUsername = adminRow.rows[0]?.username || 'admin';
        await (0, database_1.withTransaction)(async (client) => {
            const actionId = (0, crypto_1.randomUUID)();
            await client.query(`INSERT INTO discussion_moderation_actions
           (id, report_id, discussion_id, admin_id, admin_username, action, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`, [actionId, reportId, discussionId, adminId, adminUsername, action, notes || null]);
            switch (action) {
                case 'approve':
                    await client.query(`UPDATE discussion_reports
               SET moderation_status = 'Resolved', updated_at = NOW()
             WHERE discussion_id = $1`, [discussionId]);
                    break;
                case 'delete_post':
                    await client.query('UPDATE discussions SET is_deleted = TRUE, updated_at = NOW() WHERE id = $1', [discussionId]);
                    await client.query(`UPDATE discussion_reports
               SET moderation_status = 'Resolved', updated_at = NOW()
             WHERE discussion_id = $1`, [discussionId]);
                    break;
                case 'warn_user':
                    await client.query(`UPDATE discussion_reports
               SET moderation_status = 'Watching', updated_at = NOW()
             WHERE id = $1`, [reportId]);
                    break;
                case 'escalate':
                    await client.query(`UPDATE discussion_reports
               SET moderation_status = 'Escalated', updated_at = NOW()
             WHERE discussion_id = $1`, [discussionId]);
                    break;
                case 'dismiss':
                    await client.query(`UPDATE discussion_reports
               SET moderation_status = 'Resolved', updated_at = NOW()
             WHERE id = $1`, [reportId]);
                    break;
            }
        });
    }
    async getActionHistory(reportId) {
        const result = await (0, database_1.query)(`SELECT id, report_id, discussion_id, admin_username, action, notes, created_at
         FROM discussion_moderation_actions
        WHERE report_id = $1
        ORDER BY created_at DESC`, [reportId]);
        return result.rows.map((row) => ({
            id: row.id,
            reportId: row.report_id,
            discussionId: row.discussion_id,
            adminUsername: row.admin_username,
            action: row.action,
            notes: row.notes || undefined,
            createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
        }));
    }
}
exports.default = new ModerationService();
//# sourceMappingURL=moderationService.js.map