import { db } from "./database.js"
import { user, collection, card, review } from "./schema.js"
import bcrypt from 'bcrypt'

const seed = async () => {
	console.log('Starting DB seed...')
	try {
		await db.delete(review)
		await db.delete(card)
		await db.delete(collection)
		await db.delete(user)

		const salt = await bcrypt.genSalt(10)

		const SeedUsers = [
			{
				firstName: 'Alice',
				lastName: 'Smith',
				email: 'alice@example.com',
				password: await bcrypt.hash('password123', salt),
				role: 'user',
			},
			{
				firstName: 'Bob',
				lastName: 'Jones',
				email: 'bob@example.com',
				password: await bcrypt.hash('secret', salt),
				role: 'user',
			},
		]

		const insertedUsers = await db.insert(user).values(SeedUsers).returning()

		const SeedCollections = [
			{
				title: 'French Basics',
				description: 'Common words and phrases',
				isPublic: 1,
				user: insertedUsers[0].id,
			},
			{
				title: 'Physics Shortcuts',
				description: 'Key formulas',
				isPublic: 0,
				user: insertedUsers[1].id,
			},
		]

		const insertedCollections = await db.insert(collection).values(SeedCollections).returning()

		const SeedCards = [
			{
				frontText: 'Bonjour',
				backText: 'Hello',
				frontUrl: null,
				backUrl: null,
				collection: insertedCollections[0].id,
			},
			{
				frontText: 'aller',
				backText: 'to go',
				frontUrl: null,
				backUrl: null,
				collection: insertedCollections[0].id,
			},
			{
				frontText: 'Force',
				backText: 'F = m * a',
				frontUrl: null,
				backUrl: null,
				collection: insertedCollections[1].id,
			},
		]

		const insertedCards = await db.insert(card).values(SeedCards).returning()

		const SeedReviews = [
			{
				cardId: insertedCards[0].id,
				userId: insertedUsers[0].id,
				level: 1,
				lastDate: new Date().toISOString(),
			},
		]

		await db.insert(review).values(SeedReviews)

		console.log('DB seeded successfully')
	} catch (err) {
		console.error('Seeding failed:', err)
		process.exitCode = 1
	}
}

if (import.meta?.url?.startsWith('file:')) {
	seed()
}

export default seed