"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAchievements = exports.getCoinLeaderboard = exports.rewardActivity = exports.spinLuckyWheel = exports.claimDailyLoginReward = exports.subscribePremium = exports.redeemItem = exports.getPurchaseHistory = exports.getOverview = void 0;
const storeService_1 = __importDefault(require("../services/storeService"));
const getOverview = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const overview = await storeService_1.default.getStoreOverview(req.user.userId);
        res.status(200).json(overview);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getOverview = getOverview;
const getPurchaseHistory = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const limit = parseInt(req.query.limit, 10) || 30;
        const history = await storeService_1.default.getPurchaseHistory(req.user.userId, limit);
        res.status(200).json({ history });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getPurchaseHistory = getPurchaseHistory;
const redeemItem = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { itemId } = req.body;
        if (!itemId) {
            res.status(400).json({ error: 'itemId is required' });
            return;
        }
        const result = await storeService_1.default.redeemItem(req.user.userId, itemId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.redeemItem = redeemItem;
const subscribePremium = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { plan } = req.body;
        if (!plan || !['monthly', 'yearly'].includes(plan)) {
            res.status(400).json({ error: 'Valid plan is required: monthly or yearly' });
            return;
        }
        const result = await storeService_1.default.subscribePremium(req.user.userId, plan);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.subscribePremium = subscribePremium;
const claimDailyLoginReward = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const result = await storeService_1.default.claimDailyLoginReward(req.user.userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.claimDailyLoginReward = claimDailyLoginReward;
const spinLuckyWheel = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const result = await storeService_1.default.spinLuckyWheel(req.user.userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.spinLuckyWheel = spinLuckyWheel;
const rewardActivity = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { activityType, referenceId } = req.body;
        if (!activityType || !referenceId) {
            res.status(400).json({ error: 'activityType and referenceId are required' });
            return;
        }
        if (!['contest', 'interview'].includes(activityType)) {
            res.status(400).json({ error: 'activityType must be contest or interview' });
            return;
        }
        const result = await storeService_1.default.rewardActivity(req.user.userId, activityType, referenceId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.rewardActivity = rewardActivity;
const getCoinLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 20;
        const leaderboard = await storeService_1.default.getCoinLeaderboard(limit);
        res.status(200).json({ leaderboard });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getCoinLeaderboard = getCoinLeaderboard;
const getAchievements = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const achievements = await storeService_1.default.getAchievements(req.user.userId);
        res.status(200).json({ achievements });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getAchievements = getAchievements;
//# sourceMappingURL=storeController.js.map