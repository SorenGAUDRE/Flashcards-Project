import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from 'crypto';

export const questions = sqliteTable('questions',{
    id: text().primaryKey().$defaultFn(()=> randomUUID()),
    questionText: text('question_text', {length: 255}).notNull(),
    answer : text({length: 255}).notNull(),
    difficulty: text({ enum: ['easy', 'medium', 'difficult']}),
    createdAt: integer('created_at', {mode: 'timestamp'}).$defaultFn(
        () => new Date()
    ),
    createdBy:  text('created_by').references(() => users.id, { onDelete : 'cascade'}).notNull(),
})

export const user = sqliteTable('user', {
    id: text().primaryKey().$defaultFn(() => randomUUID()),
    firstName: text('first_name', {length: 255}).notNull(),
    lastName: text('last_name', {length: 255}).notNull(),
    email: text().notNull().unique(),
    password: text({length:255}).notNull(),
    role: text({length:255}).notNull
})