import { z } from 'zod'

export const recordReviewSchema = z.object({
  success: z.boolean(),
})

export const collectionIdSchemaForReview = z.object({ collectionId: z.string().uuid() })

export const cardIdSchemaForReview = z.object({ cardId: z.string().uuid() })
