import { z } from 'zod'

const cardSchema = {
  frontText: z.string().min(1).max(1000, 'Front text must be at most 1000 characters'),
  backText: z.string().min(1).max(1000, 'Back text must be at most 1000 characters'),
  frontUrl: z.string().url().optional(),
  backUrl: z.string().url().optional(),
  collectionId: z.string().uuid(),
}

export const createCardSchema = z.object(cardSchema)

export const updateCardSchema = z.object({
  frontText: cardSchema.frontText.optional(),
  backText: cardSchema.backText.optional(),
  frontUrl: cardSchema.frontUrl.optional(),
  backUrl: cardSchema.backUrl.optional(),
})

export const cardIdSchema = z.object({ id: z.string().uuid() })
