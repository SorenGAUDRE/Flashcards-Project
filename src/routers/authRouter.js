import express from 'express'
import { registerUser, loginUser , getCurrentUser , refreshToken } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.post('/register', registerUser)
router.post('/login', loginUser)
//router.post('/logout', AuthController.logout)

// Protected routes
router.get('/me', authMiddleware, getCurrentUser)
router.post('/refresh', authMiddleware, refreshToken)

export default router
