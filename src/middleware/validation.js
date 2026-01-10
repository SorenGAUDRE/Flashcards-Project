import { ZodError, ZodType } from 'zod'

export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      if (schema instanceof ZodType) {
        const parsed = schema.parse(req.body)
        // prevent empty body
        if (parsed && Object.keys(parsed).length === 0) {
          return res.status(400).send({ error: 'Invalid body', details: [{ message: 'Body cannot be empty' }] })
        }
        req.body = parsed
        next()
      } else {
        next()
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).send({ error: 'Invalid body', details: error.issues })
      }
      console.error(error)
      res.status(500).send({ error: 'Internal Server error' })
    }
  }
}

export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      if (schema instanceof ZodType) {
        schema.parse(req.params)
        next()
      } else {
        next()
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).send({ error: 'Invalid params', details: error.issues.map((i) => i.message) })
      }
      console.error(error)
      res.status(500).send({ error: 'Internal Server error' })
    }
  }
}
