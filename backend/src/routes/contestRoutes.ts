import express from 'express';
import * as contestController from '../controllers/contestController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', contestController.getPublicContests);
router.get('/admin/overview', authMiddleware, adminMiddleware, contestController.getAdminContestOverview);

export default router;
