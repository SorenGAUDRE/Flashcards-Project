import express from 'express'
import { createCard } from '../controllers/cardController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// Protected routes (require valid JWT)
router.post('/create', authMiddleware, createCard)
// Get collection by ID must be last if there are other specific routes with the same prefix


export default router