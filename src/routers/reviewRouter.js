import express from 'express'
import { recordReview, getDueCardsForCollection } from '../controllers/reviewController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { validateBody, validateParams } from '../middleware/validation.js'
import { recordReviewSchema, collectionIdSchemaForReview, cardIdSchemaForReview } from '../models/reviewSchemas.js'

const router = express.Router()

// record a review for a card
router.post('/:cardId', authMiddleware, validateParams(cardIdSchemaForReview), validateBody(recordReviewSchema), recordReview)

// get due cards for a collection
router.get('/collection/:collectionId', authMiddleware, validateParams(collectionIdSchemaForReview), getDueCardsForCollection)

export default router
