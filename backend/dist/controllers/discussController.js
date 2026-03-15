"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportPost = exports.getTrendingTopics = exports.votePoll = exports.upvotePost = exports.createPost = exports.getPost = exports.getPosts = void 0;
const discussService_1 = __importDefault(require("../services/discussService"));
const moderationService_1 = __importDefault(require("../services/moderationService"));
const VALID_REASONS = ['spam', 'harassment', 'misinformation', 'nsfw', 'other'];
const getPosts = async (req, res) => {
    try {
        const { category, skip, limit } = req.query;
        const result = await discussService_1.default.getPosts({
            category: typeof category === 'string' ? category : undefined,
            skip: skip ? parseInt(skip, 10) : 0,
            limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
            userId: req.user?.userId,
        });
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch posts' });
    }
};
exports.getPosts = getPosts;
const getPost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await discussService_1.default.getPost(id, req.user?.userId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        // Fire-and-forget view increment
        discussService_1.default.incrementViews(id).catch(() => { });
        res.status(200).json(post);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch post' });
    }
};
exports.getPost = getPost;
const createPost = async (req, res) => {
    try {
        const { title, description, category, type, tags, linkedProblemId, company, pollOptions } = req.body;
        if (!title?.trim() || !description?.trim() || !category?.trim()) {
            res.status(400).json({ error: 'title, description, and category are required' });
            return;
        }
        const post = await discussService_1.default.createPost(req.user.userId, {
            title: String(title).trim().slice(0, 300),
            description: String(description).trim().slice(0, 5000),
            category: String(category).trim(),
            type: typeof type === 'string' ? type : undefined,
            tags: Array.isArray(tags) ? tags.map(String).slice(0, 10) : [],
            linkedProblemId: typeof linkedProblemId === 'string' ? linkedProblemId : undefined,
            company: typeof company === 'string' ? company.trim() : undefined,
            pollOptions: Array.isArray(pollOptions)
                ? pollOptions.map(String).filter(Boolean).slice(0, 6)
                : [],
        });
        res.status(201).json(post);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create post' });
    }
};
exports.createPost = createPost;
const upvotePost = async (req, res) => {
    try {
        const result = await discussService_1.default.toggleUpvote(req.params.id, req.user.userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to toggle upvote' });
    }
};
exports.upvotePost = upvotePost;
const votePoll = async (req, res) => {
    try {
        const { optionIndex } = req.body;
        if (typeof optionIndex !== 'number' || !Number.isInteger(optionIndex) || optionIndex < 0) {
            res.status(400).json({ error: 'optionIndex must be a non-negative integer' });
            return;
        }
        const result = await discussService_1.default.votePoll(req.params.id, optionIndex);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to vote on poll' });
    }
};
exports.votePoll = votePoll;
const getTrendingTopics = async (_req, res) => {
    try {
        const topics = await discussService_1.default.getTrendingTopics();
        res.status(200).json({ topics });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch trending topics' });
    }
};
exports.getTrendingTopics = getTrendingTopics;
const reportPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, details } = req.body;
        if (!reason || !VALID_REASONS.includes(reason)) {
            res.status(400).json({
                error: `reason must be one of: ${VALID_REASONS.join(', ')}`,
            });
            return;
        }
        await moderationService_1.default.submitReport({
            discussionId: id,
            reporterId: req.user.userId,
            reason: reason,
            details: typeof details === 'string' ? details.trim().slice(0, 1000) : undefined,
        });
        res.status(200).json({ message: 'Report submitted successfully' });
    }
    catch (error) {
        if (error.message === 'Discussion not found') {
            res.status(404).json({ error: 'Discussion not found' });
            return;
        }
        if (error.message === 'You have already reported this post') {
            res.status(409).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: error.message || 'Failed to submit report' });
    }
};
exports.reportPost = reportPost;
//# sourceMappingURL=discussController.js.map