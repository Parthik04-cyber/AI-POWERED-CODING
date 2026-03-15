import express from 'express';
import * as moderationController from '../controllers/moderationController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

// All moderation routes require admin role
router.use(authMiddleware, adminMiddleware);

router.get('/stats', moderationController.getModerationStats);
router.get('/queue', moderationController.getModerationQueue);
router.post('/actions', moderationController.takeAction);
router.get('/actions/:reportId', moderationController.getActionHistory);

export default router;
