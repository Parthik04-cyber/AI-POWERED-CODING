import express from 'express';
import * as discussController from '../controllers/discussController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';

const router = express.Router();

// Public (auth enriches isUpvoted / author info)
router.get('/posts', optionalAuthMiddleware, discussController.getPosts);
router.get('/trending', discussController.getTrendingTopics);
router.get('/posts/:id', optionalAuthMiddleware, discussController.getPost);

// Requires authentication
router.post('/posts', authMiddleware, discussController.createPost);
router.post('/posts/:id/upvote', authMiddleware, discussController.upvotePost);
router.post('/posts/:id/vote-poll', authMiddleware, discussController.votePoll);
router.post('/posts/:id/report', authMiddleware, discussController.reportPost);

export default router;
