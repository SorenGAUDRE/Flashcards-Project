import { db } from '../db/database.js'
import 'dotenv/config'
import { user, collection, card, review } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { desc } from 'drizzle-orm'

// Middleware: check if user is admin
export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.userid
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const [foundUser] = await db
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(eq(user.id, userId))

    if (!foundUser || foundUser.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: admin role required' })
    }

    next()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

// List all users, sorted by creation date (newest first)
export const listUsers = async (req, res) => {
  try {
    const users = await db
      .select({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      })
      .from(user)
      .orderBy(desc(user.id)) 
    
    return res.status(200).json({ users })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId

    const [foundUser] = await db
      .select({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      })
      .from(user)
      .where(eq(user.id, userId))

    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Get stats
    const collections = await db.select({ id: collection.id }).from(collection).where(eq(collection.user, userId))
    const totalCards = await db
      .select({ id: card.id })
      .from(card)
      .where(eq(card.collection, collections.length > 0 ? collections[0].id : null))
    const reviews = await db
      .select({ userId: review.userId })
      .from(review)
      .where(eq(review.userId, userId))

    return res.status(200).json({
      user: {
        ...foundUser,
        stats: {
          collectionsCount: collections.length,
          cardsCount: totalCards.length,
          reviewsCount: reviews.length,
        },
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

// Delete user and all associated data (cascade handled by Drizzle schema)
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId
    const adminId = req.user?.userid

    // Prevent self-deletion
    if (userId === adminId) {
      return res.status(400).json({ message: 'Cannot delete your own account' })
    }

    const [foundUser] = await db
      .select({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName })
      .from(user)
      .where(eq(user.id, userId))

    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Delete user — Drizzle will cascade to collections, cards, and reviews via schema config
    const [deletedUser] = await db
      .delete(user)
      .where(eq(user.id, userId))
      .returning({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName })

    return res.status(200).json({
      message: 'User deleted successfully',
      deletedUser: deletedUser || foundUser,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}
