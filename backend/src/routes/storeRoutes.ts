import express from 'express';
import * as storeController from '../controllers/storeController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/overview', authMiddleware, storeController.getOverview);
router.get('/history', authMiddleware, storeController.getPurchaseHistory);
router.get('/coin-leaderboard', storeController.getCoinLeaderboard);
router.get('/achievements', authMiddleware, storeController.getAchievements);

router.post('/redeem', authMiddleware, storeController.redeemItem);
router.post('/premium/subscribe', authMiddleware, storeController.subscribePremium);
router.post('/daily-login', authMiddleware, storeController.claimDailyLoginReward);
router.post('/lucky-spin', authMiddleware, storeController.spinLuckyWheel);
router.post('/earn/activity', authMiddleware, storeController.rewardActivity);

export default router;
