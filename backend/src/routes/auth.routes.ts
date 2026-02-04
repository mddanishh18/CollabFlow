import express, { Router } from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile,
    logout
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { wrap } from '../utils/routeHandler.js';

const router: Router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', authenticate, wrap(getProfile));
router.put('/profile', authenticate, wrap(updateProfile));
router.post('/logout', authenticate, wrap(logout));

export default router;
