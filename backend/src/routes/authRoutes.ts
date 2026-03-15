import express from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authMiddleware, authController.changePassword);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.get('/users', authMiddleware, adminMiddleware, authController.getAllUsers);

export default router;
