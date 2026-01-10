import { z } from 'zod'

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const userIdSchema = z.object({ id: z.string().uuid() })
