import express from 'express';
import * as courseController from '../controllers/courseController';
import { adminMiddleware, authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/admin/all', authMiddleware, adminMiddleware, courseController.getAdminCourses);
router.get('/admin/:id', authMiddleware, adminMiddleware, courseController.getAdminCourseById);

router.post('/', authMiddleware, adminMiddleware, courseController.createCourse);
router.put('/:id', authMiddleware, adminMiddleware, courseController.updateCourse);
router.patch('/:id/status', authMiddleware, adminMiddleware, courseController.updateCourseStatus);

router.get('/', courseController.getPublishedCourses);
router.get('/:id', courseController.getPublishedCourseById);

export default router;
