"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = void 0;
const submissionService_1 = __importDefault(require("../services/submissionService"));
const getLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const leaderboard = await submissionService_1.default.getLeaderboard(limit);
        res.status(200).json({ leaderboard });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getLeaderboard = getLeaderboard;
//# sourceMappingURL=leaderboardController.js.map