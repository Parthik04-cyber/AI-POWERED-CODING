import express from 'express';
import * as submissionController from '../controllers/submissionController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/', authMiddleware, submissionController.submitCode);
router.get('/leaderboard', submissionController.getLeaderboard);
router.get('/user', authMiddleware, submissionController.getUserSubmissions);
router.get('/problem/:problemId', submissionController.getProblemSubmissions);
router.get('/:id', submissionController.getSubmissionById);

export default router;
