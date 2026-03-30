import express from 'express';
import * as problemController from '../controllers/problemController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, problemController.getAllProblems);
router.get('/categories', authMiddleware, problemController.getCategories);
router.get('/stats', authMiddleware, problemController.getProblemStats);
router.get('/:id', authMiddleware, problemController.getProblemById);

router.post('/', authMiddleware, adminMiddleware, problemController.createProblem);
router.put('/:id', authMiddleware, adminMiddleware, problemController.updateProblem);
router.delete('/:id', authMiddleware, adminMiddleware, problemController.deleteProblem);

export default router;
