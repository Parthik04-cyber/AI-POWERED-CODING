import express from 'express';
import * as leaderboardController from '../controllers/leaderboardController';

const router = express.Router();

router.get('/', leaderboardController.getLeaderboard);

export default router;