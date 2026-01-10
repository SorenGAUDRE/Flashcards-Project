import express from 'express'
import { createCard, getCardById , listCardsByCollection, updateCard, deleteCardById } from '../controllers/cardController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { validateBody, validateParams } from '../middleware/validation.js'
import { createCardSchema, updateCardSchema, cardIdSchema } from '../models/cardSchemas.js'

const router = express.Router()

// Protected routes (require valid JWT)
router.post('/create', authMiddleware, validateBody(createCardSchema), createCard)

// Get collection by ID must be last if there are other specific routes with the same prefix
router.get('/:id', authMiddleware,validateParams(cardIdSchema), getCardById)

router.get('/collection/:collectionId', authMiddleware, listCardsByCollection)
router.patch('/:id', authMiddleware, validateParams(cardIdSchema), validateBody(updateCardSchema), updateCard)
router.delete('/:id', authMiddleware, validateParams(cardIdSchema), deleteCardById)
export default router