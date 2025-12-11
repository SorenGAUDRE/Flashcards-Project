import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { randomUUID } from 'crypto';

export const user = sqliteTable('user', {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').notNull(),
})

export const collection = sqliteTable('collection', {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    title: text('title').notNull(),
    description: text('description'),
    isPublic: integer('is_public').notNull(),
    user: text('user').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const card = sqliteTable('card', {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    frontText: text('front_text').notNull(),
    backText: text('back_text').notNull(),
    frontUrl: text('front_url'),
    backUrl: text('back_url'),
    collection: text('collection').notNull().references(() => collection.id, { onDelete: 'cascade' }),
})

export const review = sqliteTable('review', {
    cardId: text('card_id').notNull().references(() => card.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    level: integer('level').notNull(),
    lastDate: text('last_date').notNull(),
}, (review) => ({
    pk: primaryKey(review.cardId, review.userId),
}))