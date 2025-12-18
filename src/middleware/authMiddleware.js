import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || '1234567890changemeinproduction'



export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header',
      })
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader

    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    console.error('Auth middleware error:', error.message)
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
  }
}



