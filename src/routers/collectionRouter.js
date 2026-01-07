import express from 'express'
import { createCollection, getCollectionById, listUserCollections } from '../controllers/collectionController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { searchPublicCollections } from '../controllers/collectionController.js'

const router = express.Router()

// Protected routes (require valid JWT)
router.post('/create', authMiddleware, createCollection)
router.get('/search', authMiddleware, searchPublicCollections)
router.get('/:id', authMiddleware, getCollectionById)
router.get('/me', authMiddleware, listUserCollections)

export default router