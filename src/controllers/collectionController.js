import { db } from '../db/database.js'
import 'dotenv/config'
import { collection } from '../db/schema.js'


export const createCollection = async (req, res) => {
  const { title, description, isPublic } = req.body
  try {
    const userId = req.user?.userid
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User not logged in' })
    }

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