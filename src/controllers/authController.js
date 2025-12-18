import bcrypt from 'bcrypt'
import { db } from '../db/database.js'
import { user } from '../db/schema.js'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { eq } from 'drizzle-orm'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'


export const registerUser = async (req, res) => {
  const { email, password, firstName, lastName } = req.body
  try {

    const salt = await bcrypt.genSalt(10)
    const pass = await bcrypt.hash(password, salt)

    const [newUser] = await db
      .insert(user)
      .values({ email, firstName: firstName, lastName: lastName, password: pass, role: 'user' })
      .returning({ email: user.email, firstName: user.firstName, lastName: user.lastName, id: user.id, role: user.role })

    const token = jwt.sign({ userid: newUser.id }, process.env.JWT_SECRET || JWT_SECRET, { expiresIn: '24h' })

    return res.status(201).send({ message: 'User created', data: newUser, token })
  } catch (error) {
    console.error(error)
    return res.status(500).json(error)
  }
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const [found] = await db.select({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        role: user.role,
      })
      .from(user)
      .where(eq(user.email, email))

    if (!found) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isValidPassword = await bcrypt.compare(password, found.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign({ userid: found.id }, process.env.JWT_SECRET || JWT_SECRET, { expiresIn: '24h' })

    return res.status(200).json({
      message: 'User logged in',
      userData: {
        email: found.email,
        firstName: found.firstName,
        lastName: found.lastName,
        id: found.id,
      },
      token,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json(error)
  }
}


export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.userid
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const [found] = await db.select().from(user).where(eq(user.id, userId))
    if (!found) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user: found })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const refreshToken = async (req, res) => {
  try {
    const userId = req.user?.userid
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = jwt.sign(
      { userid: userId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({ token })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
 
