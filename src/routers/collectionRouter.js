import express from 'express'
import { createCollection } from '../controllers/collectionController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// Protected routes (require valid JWT)
router.post('/create', authMiddleware, createCollection)

export default router