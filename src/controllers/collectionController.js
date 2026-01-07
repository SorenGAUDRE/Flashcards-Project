import { db } from '../db/database.js'
import 'dotenv/config'
import { collection, user } from '../db/schema.js'
import { eq } from 'drizzle-orm'

// Create a new collection  
export const createCollection = async (req, res) => {

  const { title, description, isPublic } = req.body

  try {
    const userId = req.user?.userid
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User not logged in' })
    }
    // Insert new collection into the database
    const [newCollection] = await db
      .insert(collection)
      .values({ title, description, isPublic, user: userId })
      .returning({ title: collection.title, description: collection.description, isPublic: collection.isPublic, user: collection.user })

    return res.status(201).send({ message: 'Collection created', data: newCollection })
  } catch (error) {
    console.error(error)
    return res.status(500).json(error)
  }
}


export const getCollectionById = async (req, res) => {
  try {
    const collectionId = req.params.id
    const requestingUserId = req.user?.userid

    if (!requestingUserId) {
      return res.status(401).json({ message: 'Unauthorized: User not logged in' })
    }

    // Fetch the collection
    const [found] = await db
      .select({ id: collection.id, title: collection.title, description: collection.description, isPublic: collection.isPublic, user: collection.user })
      .from(collection)
      .where(eq(collection.id, collectionId))

    if (!found) {
      return res.status(404).json({ message: 'Collection not found' })
    }

    // Check access permissions
    const isPublic = Number(found.isPublic) === 1
    const isOwner = found.user === requestingUserId

    if (isPublic || isOwner) {
      return res.status(200).json({ collection: found })
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


export const listUserCollections = async (req, res) => {
  try {
    const requestingUserId = req.user?.userid

    if (!requestingUserId) {
      return res.status(401).json({ message: 'Unauthorized: User not logged in' })
    }

    // Fetch collections belonging to the requesting user
    const collections = await db
      .select({ id: collection.id, title: collection.title, description: collection.description, isPublic: collection.isPublic, user: collection.user })
      .from(collection)
      .where(eq(collection.user, requestingUserId))

    return res.status(200).json({ collections })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}


export const searchPublicCollections = async (req, res) => {
  try {
    const requestingUserId = req.user?.userid
    if (!requestingUserId) {
      return res.status(401).json({ message: 'Unauthorized: User not logged in' })
    }

    const titleQuery = (req.query.title || '').toString().trim()
    if (!titleQuery) {
      return res.status(400).json({ message: 'Query parameter "title" is required' })
    }

    // Fetch public collections and filter in JS 
    const rows = await db
      .select({ id: collection.id, title: collection.title, description: collection.description, isPublic: collection.isPublic, user: collection.user })
      .from(collection)
      .where(eq(collection.isPublic, 1))

    const q = titleQuery.toLowerCase()
    const matches = rows.filter((c) => (c.title || '').toLowerCase().includes(q))

    return res.status(200).json({ collections: matches })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}