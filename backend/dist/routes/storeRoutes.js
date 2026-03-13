"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storeController = __importStar(require("../controllers/storeController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/overview', auth_1.authMiddleware, storeController.getOverview);
router.get('/history', auth_1.authMiddleware, storeController.getPurchaseHistory);
router.get('/coin-leaderboard', storeController.getCoinLeaderboard);
router.get('/achievements', auth_1.authMiddleware, storeController.getAchievements);
router.post('/redeem', auth_1.authMiddleware, storeController.redeemItem);
router.post('/premium/subscribe', auth_1.authMiddleware, storeController.subscribePremium);
router.post('/daily-login', auth_1.authMiddleware, storeController.claimDailyLoginReward);
router.post('/lucky-spin', auth_1.authMiddleware, storeController.spinLuckyWheel);
router.post('/earn/activity', auth_1.authMiddleware, storeController.rewardActivity);
exports.default = router;
//# sourceMappingURL=storeRoutes.js.map