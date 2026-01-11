import { db } from '../db/database.js'
import 'dotenv/config'
import { review, card, collection, user } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'

const intervals = [1, 2, 4, 8, 16]
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

function nextReviewDateISO(level, lastDateISO) {
  // level is 1-5, convert to index 0-4
  const idx = clamp(Number(level) - 1, 0, intervals.length - 1)
  const days = intervals[idx]
  const base = lastDateISO ? new Date(lastDateISO) : new Date()
  const next = new Date(base.getTime() + days * 24 * 60 * 60 * 1000)
  return next.toISOString()
}

export const recordReview = async (req, res) => {
  try {
    const cardId = req.params.cardId
    const userId = req.user?.userid
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { success } = req.body

    // fetch card and collection
    const [foundCard] = await db
      .select({ id: card.id, collection: card.collection })
      .from(card)
      .where(eq(card.id, cardId))

    if (!foundCard) return res.status(404).json({ message: 'Card not found' })

    const [foundCollection] = await db
      .select({ id: collection.id, user: collection.user, isPublic: collection.isPublic })
      .from(collection)
      .where(eq(collection.id, foundCard.collection))

    if (!foundCollection) return res.status(404).json({ message: 'Collection not found' })

    // verify ownership or admin OR collection is public
    if (foundCollection.user !== userId) {
      const isPublic = Number(foundCollection.isPublic) === 1
      
      if (!isPublic) {
        const [requester] = await db
          .select({ id: user.id, role: user.role })
          .from(user)
          .where(eq(user.id, userId))

        if (!(requester && requester.role === 'admin')) {
          return res.status(403).json({ message: 'Forbidden: only owner or admin can review private collections' })
        }
      }
    }

    // find existing review for this user/card
    const [existing] = await db
      .select({ cardId: review.cardId, userId: review.userId, level: review.level, lastDate: review.lastDate })
      .from(review)
      .where(and(eq(review.cardId, cardId), eq(review.userId, userId)))

    const nowISO = new Date().toISOString()
    if (existing) {
      // algorithm: level 1-5, success increment, failure decrement
      const prevLevel = Number(existing.level) || 1
      const newLevel = success ? clamp(prevLevel + 1, 1, 5) : clamp(prevLevel - 1, 1, 5)

      await db
        .update(review)
        .set({ level: newLevel, lastDate: nowISO })
        .where(and(eq(review.cardId, cardId), eq(review.userId, userId)))

      return res.status(200).json({ message: 'Review updated', review: { cardId, userId, level: newLevel, lastDate: nowISO, nextReview: nextReviewDateISO(newLevel, nowISO) } })
    }

    // create new review record
    const initialLevel = success ? 1 : 1
    const [inserted] = await db
      .insert(review)
      .values({ cardId, userId, level: initialLevel, lastDate: nowISO })
      .returning({ cardId: review.cardId, userId: review.userId, level: review.level, lastDate: review.lastDate })

    return res.status(201).json({ message: 'Review recorded', review: { ...inserted, nextReview: nextReviewDateISO(initialLevel, nowISO) } })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const getDueCardsForCollection = async (req, res) => {
  try {
    const collectionId = req.params.collectionId
    const userId = req.user?.userid
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    // fetch collection
    const [foundCollection] = await db
      .select({ id: collection.id, user: collection.user, isPublic: collection.isPublic })
      .from(collection)
      .where(eq(collection.id, collectionId))

    if (!foundCollection) return res.status(404).json({ message: 'Collection not found' })

    // owner or admin only, OR collection is public
    if (foundCollection.user !== userId) {
      const isPublic = Number(foundCollection.isPublic) === 1
      
      if (!isPublic) {
        const [requester] = await db
          .select({ id: user.id, role: user.role })
          .from(user)
          .where(eq(user.id, userId))

        if (!(requester && requester.role === 'admin')) {
          return res.status(403).json({ message: 'Forbidden: only owner or admin can access due cards in private collections' })
        }
      }
    }

    // fetch cards in collection
    const cards = await db
      .select({ id: card.id, frontText: card.frontText, backText: card.backText })
      .from(card)
      .where(eq(card.collection, collectionId))

    // fetch all reviews for these card ids for this user
    const cardIds = cards.map((c) => c.id)
    let reviewsMap = {}
    if (cardIds.length > 0) {
      const rows = await db
        .select({ cardId: review.cardId, level: review.level, lastDate: review.lastDate })
        .from(review)
        .where(eq(review.userId, userId))
      // map by cardId
      reviewsMap = rows.reduce((acc, r) => {
        acc[r.cardId] = r
        return acc
      }, {})
    }

    const now = new Date()
    const due = cards.filter((c) => {
      const r = reviewsMap[c.id]
      if (!r) return false // never reviewed -> due ?
      const nextISO = nextReviewDateISO(r.level, r.lastDate)
      const next = new Date(nextISO)
      return next <= now
    }).map((c) => {
      const r = reviewsMap[c.id]
      const level = r ? r.level : null
      const lastDate = r ? r.lastDate : null
      const nextReview = r ? nextReviewDateISO(r.level, r.lastDate) : null
      return { ...c, level, lastDate, nextReview }
    })

    return res.status(200).json({ cards: due })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}
