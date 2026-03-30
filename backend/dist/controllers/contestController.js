"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminContestOverview = exports.getPublicContests = void 0;
const contestService_1 = __importDefault(require("../services/contestService"));
const getPublicContests = async (_req, res) => {
    try {
        const payload = await contestService_1.default.getPublicContests();
        res.status(200).json(payload);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to load contests' });
    }
};
exports.getPublicContests = getPublicContests;
const getAdminContestOverview = async (_req, res) => {
    try {
        const overview = await contestService_1.default.getAdminOverview();
        res.status(200).json(overview);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to load contests' });
    }
};
exports.getAdminContestOverview = getAdminContestOverview;
//# sourceMappingURL=contestController.js.map