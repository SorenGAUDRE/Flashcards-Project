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
    const existingCollection = await db
      .select()
      .from(collection)
      .where(and(eq(collection.id, collectionId), eq(collection.user, userId)))

    if (existingCollection.length === 0) {
      return res.status(403).json({ message: 'Collection not found or does not belong to the user' })
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