# Flashcards API

API RESTful pour gérer des collections de flashcards avec répétition espacée.

## Installation

```powershell
npm install
```

## Configuration

Créez un fichier `.env` à la racine :

```env
JWT_SECRET=your-secret-key-change-in-production
DB_FILE=file:local.db
```

## Initialisation de la base de données

```powershell
# Créer les tables
npm run db:push

# Remplir avec des données de test
npm run db:seed
```

## Lancement

```powershell
# Mode développement (rechargement automatique)
npm run dev

```

Le serveur démarre sur `http://localhost:3000`

## Utilisateurs par défaut (après seeding)

| Email | Mot de passe | Rôle |
|-------|------------|------|
| alice@example.com | password123 | user |
| bob@example.com | secret | admin |

## Structure

```
src/
├── controllers/     # Logique métier
├── db/             # Base de données (Drizzle)
├── middleware/     # Authentification & validation
├── models/         # Schémas Zod
├── routers/        # Routes Express
└── server.js       # Point d'entrée
```

## Documentation technique

[Voir la documentation de l’API](./docs/API_DOCUMENTATION.md)
