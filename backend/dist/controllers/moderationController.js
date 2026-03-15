"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActionHistory = exports.takeAction = exports.getModerationQueue = exports.getModerationStats = void 0;
const moderationService_1 = __importDefault(require("../services/moderationService"));
const VALID_ACTIONS = [
    'approve',
    'delete_post',
    'warn_user',
    'escalate',
    'dismiss',
];
const getModerationStats = async (_req, res) => {
    try {
        const stats = await moderationService_1.default.getModerationStats();
        res.status(200).json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch moderation stats' });
    }
};
exports.getModerationStats = getModerationStats;
const getModerationQueue = async (req, res) => {
    try {
        const { skip, limit, status } = req.query;
        const result = await moderationService_1.default.getModerationQueue({
            skip: skip ? parseInt(skip, 10) : 0,
            limit: limit ? Math.min(parseInt(limit, 10), 100) : 50,
            status: typeof status === 'string' ? status : undefined,
        });
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch moderation queue' });
    }
};
exports.getModerationQueue = getModerationQueue;
const takeAction = async (req, res) => {
    try {
        const { reportId, discussionId, action, notes } = req.body;
        if (!reportId || typeof reportId !== 'string') {
            res.status(400).json({ error: 'reportId is required' });
            return;
        }
        if (!discussionId || typeof discussionId !== 'string') {
            res.status(400).json({ error: 'discussionId is required' });
            return;
        }
        if (!action || !VALID_ACTIONS.includes(action)) {
            res.status(400).json({ error: `action must be one of: ${VALID_ACTIONS.join(', ')}` });
            return;
        }
        await moderationService_1.default.takeAction({
            reportId,
            discussionId,
            adminId: req.user.userId,
            action: action,
            notes: typeof notes === 'string' ? notes.trim().slice(0, 500) : undefined,
        });
        res.status(200).json({ message: `Action '${action}' taken successfully` });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to take moderation action' });
    }
};
exports.takeAction = takeAction;
const getActionHistory = async (req, res) => {
    try {
        const { reportId } = req.params;
        const history = await moderationService_1.default.getActionHistory(reportId);
        res.status(200).json({ history });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch action history' });
    }
};
exports.getActionHistory = getActionHistory;
//# sourceMappingURL=moderationController.js.map