import express from 'express'
import { createCard, getCardById , listCardsByCollection, updateCard, deleteCardById } from '../controllers/cardController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// Protected routes (require valid JWT)
router.post('/create', authMiddleware, createCard)

// Get collection by ID must be last if there are other specific routes with the same prefix
router.get('/:id', authMiddleware, getCardById)

router.get('/collection/:collectionId', authMiddleware, listCardsByCollection)
router.patch('/:id', authMiddleware, updateCard)
router.delete('/:id', authMiddleware, deleteCardById)  
export default router