import express from 'express'
import { registerUser, loginUser , getCurrentUser , refreshToken } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { validateBody } from '../middleware/validation.js'
import { registerUserSchema, loginUserSchema } from '../models/userSchemas.js'

const router = express.Router()

// Public routes
router.post('/register', validateBody(registerUserSchema), registerUser)
router.post('/login', validateBody(loginUserSchema), loginUser)
//router.post('/logout', AuthController.logout)

// Protected routes
router.get('/me', authMiddleware, getCurrentUser)
router.post('/refresh', authMiddleware, refreshToken)

export default router
