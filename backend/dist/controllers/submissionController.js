"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubmissionsAdmin = exports.executeCode = exports.getLeaderboard = exports.getProblemSubmissions = exports.getUserSubmissions = exports.getSubmissionById = exports.submitCode = void 0;
const submissionService_1 = __importDefault(require("../services/submissionService"));
const submitCode = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { problemId, code, language } = req.body;
        if (!problemId || !code || !language) {
            res.status(400).json({ error: 'Problem ID, code, and language are required' });
            return;
        }
        const submission = await submissionService_1.default.submitCode(req.user.userId, problemId, code, language);
        res.status(201).json(submission);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.submitCode = submitCode;
const getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await submissionService_1.default.getSubmissionById(id);
        res.status(200).json(submission);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
};
exports.getSubmissionById = getSubmissionById;
const getUserSubmissions = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const result = await submissionService_1.default.getUserSubmissions(req.user.userId, skip, limit);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getUserSubmissions = getUserSubmissions;
const getProblemSubmissions = async (req, res) => {
    try {
        const { problemId } = req.params;
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const result = await submissionService_1.default.getProblemSubmissions(problemId, skip, limit);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getProblemSubmissions = getProblemSubmissions;
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
const executeCode = async (req, res) => {
    try {
        const { code, language, input } = req.body;
        if (!code || !language) {
            res.status(400).json({ error: 'Code and language are required' });
            return;
        }
        const result = await submissionService_1.default.executeCode(code, language, input || '');
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to execute code' });
    }
};
exports.executeCode = executeCode;
const getAllSubmissionsAdmin = async (req, res) => {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 20;
        const result = await submissionService_1.default.getAllSubmissions(skip, limit);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getAllSubmissionsAdmin = getAllSubmissionsAdmin;
//# sourceMappingURL=submissionController.js.map