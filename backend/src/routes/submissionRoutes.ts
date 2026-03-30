import express from 'express';
import * as submissionController from '../controllers/submissionController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { subscriptionAccessMiddleware } from '../middleware/subscription';

const router = express.Router();

router.post('/', authMiddleware, subscriptionAccessMiddleware, submissionController.submitCode);
router.post('/run-samples', authMiddleware, subscriptionAccessMiddleware, submissionController.runCodeWithSamples);
router.get('/leaderboard', submissionController.getLeaderboard);
router.post('/execute', authMiddleware, subscriptionAccessMiddleware, submissionController.executeCode);
router.get('/admin/analytics', authMiddleware, adminMiddleware, submissionController.getAdminAnalytics);
router.get('/admin/all', authMiddleware, adminMiddleware, submissionController.getAllSubmissionsAdmin);
router.get('/user', authMiddleware, subscriptionAccessMiddleware, submissionController.getUserSubmissions);
router.get('/problem/:problemId', submissionController.getProblemSubmissions);
router.get('/:id', submissionController.getSubmissionById);

export default router;
