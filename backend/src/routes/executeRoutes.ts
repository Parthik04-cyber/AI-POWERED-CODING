import express from 'express';
import * as submissionController from '../controllers/submissionController';
import { authMiddleware } from '../middleware/auth';
import { subscriptionAccessMiddleware } from '../middleware/subscription';

const router = express.Router();

router.post('/', authMiddleware, subscriptionAccessMiddleware, submissionController.executeCode);

export default router;