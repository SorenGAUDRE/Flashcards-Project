import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { listUsers, getUserById, deleteUser, isAdmin } from '../controllers/adminController.js'
import { validateParams } from '../middleware/validation.js'
import { userIdSchema } from '../models/adminSchemas.js'

const router = express.Router()

// All admin routes require authentication and admin role
router.use(authMiddleware, isAdmin)

router.get('/users', listUsers)
router.get('/users/:userId', validateParams(userIdSchema), getUserById)
router.delete('/users/:userId', validateParams(userIdSchema), deleteUser)

export default router
