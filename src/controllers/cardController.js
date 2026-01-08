import { db } from '../db/database.js'
import 'dotenv/config'
import { card, user, collection } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'

// Create a new flashcard  
export const createCard = async (req, res) => {

  const { frontText, backText, frontUrl, backUrl, collectionId } = req.body

  try {
    const userId = req.user?.userid
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User not logged in' })
    }
    // Check if the collection belongs to the user
    const [existingCollection] = await db
      .select()
      .from(collection)
      .where(and(eq(collection.id, collectionId)))

    if (!existingCollection) {
      return res.status(403).json({ message: 'Collection not found' })
    }
    if (existingCollection.user != userId) {
        return res.status(403).json({ message: 'Collection does not belong to the user' })
    }

    // Insert new flashcard into the database
    const [newCard] = await db
      .insert(card)
      .values({ frontText, backText, frontUrl, backUrl, collection: collectionId })
      .returning({ frontText: card.frontText, backText: card.backText, frontUrl: card.frontUrl, backUrl: card.backUrl, collection: card.collection })
    return res.status(201).send({ message: 'Card created', data: newCard })
  } catch (error) {
    console.error(error)
    return res.status(500).json(error)
  }
}

export const getCardById = async (req, res) => {
  try {
    const cardId = req.params.id
    const requestingUserId = req.user?.userid

    if (!requestingUserId) {
      return res.status(401).json({ message: 'Unauthorized: User not logged in' })
    }

    // Fetch the card
    const [found] = await db
      .select({ id: card.id, frontText: card.frontText, backText: card.backText, frontUrl: card.frontUrl, backUrl: card.backUrl, collection: card.collection })
      .from(card)
      .where(eq(card.id, cardId))

    if (!found) {
      return res.status(404).json({ message: 'Card not found' })
    }

    // Fetch the collection to check visibility and ownership
    const [foundCollection] = await db
      .select({ id: collection.id, isPublic: collection.isPublic, user: collection.user })
      .from(collection)
      .where(eq(collection.id, found.collection))

    const isPublic = Number(foundCollection.isPublic) === 1
    const isOwner = foundCollection.user === requestingUserId

    if (isPublic || isOwner) {
      return res.status(200).json({ card: found })
    }

    // Not public and not owner -> allow if requester is admin
    const [requester] = await db
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(eq(user.id, requestingUserId))

    // If requester is admin, allow access
    if (requester && requester.role === 'admin') {
      return res.status(200).json({ collection: found })
    }

    return res.status(403).json({ message: 'Forbidden: You do not have access to this collection' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

// List all cards in a collection with access control based on collection visibility
export const listCardsByCollection = async (req, res) => {
  try {
    const collectionId = req.params.collectionId
    const userId = req.user?.userid

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User not logged in' })
    }

    // Fetch the collection to check visibility and ownership
    const [found] = await db
      .select({ id: collection.id, isPublic: collection.isPublic, user: collection.user })
      .from(collection)
      .where(eq(collection.id, collectionId))

    if (!found) {
      return res.status(404).json({ message: 'Collection not found' })
    }

    const isPublic = Number(found.isPublic) === 1
    const isOwner = found.user === userId

    // If not public and not owner, allow only admins
    if (!isPublic && !isOwner) {
      const [requester] = await db
        .select({ id: user.id, role: user.role })
        .from(user)
        .where(eq(user.id, userId))

      if (!(requester && requester.role === 'admin')) {
        return res.status(403).json({ message: 'Forbidden: You do not have access to this collection' })
      }
    }
    // Allowed: fetch cards belonging to the collection
    const cards = await db
      .select({ id: card.id, frontText: card.frontText, backText: card.backText, frontUrl: card.frontUrl, backUrl: card.backUrl })
      .from(card)
      .where(eq(card.collection, collectionId))

    return res.status(200).json({ cards })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const updateCard = async (req, res) => {
  try {
    const cardId = req.params.id
    const requestingUserId = req.user?.userid

    if (!requestingUserId) {
      return res.status(401).json({ message: 'Unauthorized: User not logged in' })
    }

    const [found] = await db
      .select({ id: card.id, frontText: card.frontText, backText: card.backText, frontUrl: card.frontUrl, backUrl: card.backUrl, collection: card.collection })
      .from(card)
      .where(eq(card.id, cardId))

    if (!found) {
      return res.status(404).json({ message: 'Card not found' })
    }

    const [foundCollection] = await db
      .select({ id: collection.id, isPublic: collection.isPublic, user: collection.user })
      .from(collection)
      .where(eq(collection.id, found.collection))

    if (foundCollection.user !== requestingUserId) {
      return res.status(403).json({ message: 'Forbidden: Only the owner can modify this card' })
    }

    const { frontText, backText, frontUrl, backUrl } = req.body

    const updates = {}
    if (typeof frontText !== 'undefined') updates.frontText = frontText
    if (typeof backText !== 'undefined') updates.backText = backText
    if (typeof frontUrl !== 'undefined') updates.frontUrl = frontUrl
    if (typeof backUrl !== 'undefined') updates.backUrl = backUrl

    // If no fields provided
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No updatable fields provided' })
    }

    const [updated] = await db
      .update(card)
      .set(updates)
      .where(eq(card.id, cardId))
      .returning({ id: card.id, frontText: card.frontText, backText: card.backText, frontUrl: card.frontUrl, backUrl: card.backUrl, collection: card.collection })

    return res.status(200).json({ message: 'Card updated', card: updated })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

// Delete a card  
export const deleteCardById = async (req, res) => {
  try {
   const cardId = req.params.id
    const requestingUserId = req.user?.userid

    if (!requestingUserId) {
      return res.status(401).json({ message: 'Unauthorized: User not logged in' })
    }

    const [found] = await db
      .select({ id: card.id, frontText: card.frontText, backText: card.backText, frontUrl: card.frontUrl, backUrl: card.backUrl, collection: card.collection })
      .from(card)
      .where(eq(card.id, cardId))

    if (!found) {
      return res.status(404).json({ message: 'Card not found' })
    }

    const [foundCollection] = await db
      .select({ id: collection.id, isPublic: collection.isPublic, user: collection.user })
      .from(collection)
      .where(eq(collection.id, found.collection))

    if (foundCollection.user !== requestingUserId) {
      return res.status(403).json({ message: 'Forbidden: Only the owner can delete this card' })
    }
    await db
      .delete(card)
      .where(eq(card.id, cardId))
    return res.status(200).json({ card: found })

  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}