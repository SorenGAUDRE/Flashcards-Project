import express from 'express'
import { createCollection, getCollectionById, listUserCollections, searchPublicCollections, updateCollection, deleteCollectionById } from '../controllers/collectionController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// Protected routes (require valid JWT)
router.post('/create', authMiddleware, createCollection)
router.get('/search', authMiddleware, searchPublicCollections)
router.get('/me', authMiddleware, listUserCollections)
router.delete('/:id', authMiddleware, deleteCollectionById)
router.patch('/:id', authMiddleware, updateCollection)
// Get collection by ID must be last if there are other specific routes with the same prefix
router.get('/:id', authMiddleware, getCollectionById)

export default router