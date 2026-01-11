import { z } from 'zod'

const collectionSchema = {
  title: z.string().min(1).max(255, 'Title must be at most 255 characters'),
  description: z.string().max(1000).optional(),
  isPublic: z.union([z.boolean(), z.number()]).optional(),
}

export const createCollectionSchema = z.object(collectionSchema)

export const updateCollectionSchema = z.object({
  title: collectionSchema.title.optional(),
  description: collectionSchema.description.optional(),
  isPublic: collectionSchema.isPublic.optional(),
})

export const collectionIdSchema = z.object({ collectionId: z.string().uuid() })
