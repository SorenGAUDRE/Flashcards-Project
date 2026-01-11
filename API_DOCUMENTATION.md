# Documentation Technique API Flashcards

## Vue d'ensemble

API RESTful pour gérer des collections de flashcards avec révision espacée pour l'apprentissage.

**Base URL** : `http://localhost:3000/api`

---

## Endpoints

### 1. Authentification

#### 1.1 Enregistrement utilisateur
- **Méthode** : `POST`
- **Chemin** : `/auth/register`
- **Authentification** : Publique
- **Description** : Crée un nouvel utilisateur et retourne un JWT

**Body** :
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Réponse** (201) :
```json
{
  "message": "User created",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "token": "eyJhbGc..."
}
```

**Validation Zod** : email valide, password ≥ 6 caractères, firstName/lastName ≥ 1 char

---

#### 1.2 Connexion utilisateur
- **Méthode** : `POST`
- **Chemin** : `/auth/login`
- **Authentification** : Publique
- **Description** : Authentifie l'utilisateur avec email/password et retourne un JWT

**Body** :
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse** (200) :
```json
{
  "message": "User logged in",
  "userData": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "eyJhbGc..."
}
```

**Validation Zod** : email valide, password requis

---

#### 1.3 Récupérer utilisateur actuel
- **Méthode** : `GET`
- **Chemin** : `/auth/me`
- **Authentification** : Authentifiée (Bearer token)
- **Description** : Retourne les informations de l'utilisateur connecté

**Réponse** (200) :
```json
{
  "userData": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

---

#### 1.4 Renouveler token
- **Méthode** : `POST`
- **Chemin** : `/auth/refresh`
- **Authentification** : Authentifiée (Bearer token)
- **Description** : Génère un nouveau token JWT

**Réponse** (200) :
```json
{
  "token": "eyJhbGc..."
}
```

---

### 2. Collections

#### 2.1 Créer une collection
- **Méthode** : `POST`
- **Chemin** : `/collection/create`
- **Authentification** : Authentifiée
- **Description** : Crée une nouvelle collection appartenant à l'utilisateur authentifié

**Body** :
```json
{
  "title": "My Collection",
  "description": "Description optionnelle",
  "isPublic": 1
}
```

**Réponse** (201) :
```json
{
  "message": "Collection created",
  "data": {
    "id": "uuid",
    "title": "My Collection",
    "description": "Description optionnelle",
    "isPublic": 1,
    "user": "uuid"
  }
}
```

**Validation Zod** : title ≤ 255 chars, description optional ≤ 1000 chars, isPublic boolean/number

---

#### 2.2 Récupérer collection par ID
- **Méthode** : `GET`
- **Chemin** : `/collection/:id`
- **Authentification** : Authentifiée
- **Description** : Récupère les détails d'une collection. Accès : propriétaire, collection publique, ou admin

**Route Params** :
- `id` : UUID de la collection

**Réponse** (200) :
```json
{
  "collection": {
    "id": "uuid",
    "title": "My Collection",
    "description": "...",
    "isPublic": 1,
    "user": "uuid"
  }
}
```

**Erreurs** :
- 404 : Collection not found
- 403 : Collection privée et accès refusé

---

#### 2.3 Lister collections de l'utilisateur
- **Méthode** : `GET`
- **Chemin** : `/collection/me`
- **Authentification** : Authentifiée
- **Description** : Retourne toutes les collections créées par l'utilisateur authentifié

**Réponse** (200) :
```json
{
  "collections": [
    {
      "id": "uuid",
      "title": "Collection 1",
      "description": "...",
      "isPublic": 1,
      "user": "uuid"
    }
  ]
}
```

---

#### 2.4 Rechercher collections publiques
- **Méthode** : `GET`
- **Chemin** : `/collection/search`
- **Authentification** : Authentifiée
- **Description** : Recherche les collections publiques par titre

**Query Params** :
- `title` (requis) : Texte à rechercher (case-insensitive)

**Réponse** (200) :
```json
{
  "collections": [
    {
      "id": "uuid",
      "title": "Public Collection",
      "description": "...",
      "isPublic": 1,
      "user": "uuid"
    }
  ]
}
```

**Erreurs** :
- 400 : Query parameter "title" is required

---

#### 2.5 Mettre à jour collection
- **Méthode** : `PATCH`
- **Chemin** : `/collection/:id`
- **Authentification** : Authentifiée (propriétaire uniquement)
- **Description** : Met à jour une collection

**Route Params** :
- `id` : UUID de la collection

**Body** (tous les champs optionnels) :
```json
{
  "title": "New Title",
  "description": "New description",
  "isPublic": 1
}
```

**Réponse** (200) :
```json
{
  "message": "Collection updated",
  "collection": {
    "id": "uuid",
    "title": "New Title",
    "description": "New description",
    "isPublic": 1,
    "user": "uuid"
  }
}
```

**Validation Zod** : Champs identiques au POST (optionnels)

**Erreurs** :
- 404 : Collection not found
- 403 : Forbidden (pas propriétaire)
- 400 : No updatable fields provided

---

#### 2.6 Supprimer collection
- **Méthode** : `DELETE`
- **Chemin** : `/collection/:id`
- **Authentification** : Authentifiée (propriétaire uniquement)
- **Description** : Supprime une collection et toutes ses cartes

**Route Params** :
- `id` : UUID de la collection

**Réponse** (200) :
```json
{
  "collection": {
    "id": "uuid",
    "title": "...",
    "description": "...",
    "isPublic": 1,
    "user": "uuid"
  }
}
```

**Erreurs** :
- 404 : Collection not found
- 403 : Forbidden (pas propriétaire)

---

### 3. Flashcards

#### 3.1 Créer une flashcard
- **Méthode** : `POST`
- **Chemin** : `/card/create`
- **Authentification** : Authentifiée
- **Description** : Crée une nouvelle flashcard dans une collection. La collection doit appartenir à l'utilisateur

**Body** :
```json
{
  "frontText": "Question",
  "backText": "Réponse",
  "frontUrl": "https://example.com/image.jpg",
  "backUrl": "https://example.com/image2.jpg",
  "collectionId": "uuid"
}
```

**Réponse** (201) :
```json
{
  "message": "Card created",
  "data": {
    "frontText": "Question",
    "backText": "Réponse",
    "frontUrl": "https://example.com/image.jpg",
    "backUrl": "https://example.com/image2.jpg",
    "collection": "uuid"
  }
}
```

**Validation Zod** : 
- frontText/backText : 1-1000 chars
- frontUrl/backUrl : URLs valides (optionnels)
- collectionId : UUID valide

**Erreurs** :
- 403 : Collection not found ou n'appartient pas à l'utilisateur

---

#### 3.2 Récupérer flashcard par ID
- **Méthode** : `GET`
- **Chemin** : `/card/:id`
- **Authentification** : Authentifiée
- **Description** : Récupère une flashcard. Accès : propriétaire de la collection, collection publique, ou admin

**Route Params** :
- `id` : UUID de la flashcard

**Réponse** (200) :
```json
{
  "card": {
    "id": "uuid",
    "frontText": "Question",
    "backText": "Réponse",
    "frontUrl": "...",
    "backUrl": "...",
    "collection": "uuid"
  }
}
```

**Erreurs** :
- 404 : Card not found
- 403 : Accès refusé

---

#### 3.3 Lister flashcards d'une collection
- **Méthode** : `GET`
- **Chemin** : `/card/collection/:collectionId`
- **Authentification** : Authentifiée
- **Description** : Retourne toutes les flashcards d'une collection. Accès : propriétaire, collection publique, ou admin

**Route Params** :
- `collectionId` : UUID de la collection

**Réponse** (200) :
```json
{
  "cards": [
    {
      "id": "uuid",
      "frontText": "Question",
      "backText": "Réponse",
      "frontUrl": "...",
      "backUrl": "..."
    }
  ]
}
```

**Erreurs** :
- 404 : Collection not found
- 403 : Accès refusé

---

#### 3.4 Mettre à jour flashcard
- **Méthode** : `PATCH`
- **Chemin** : `/card/:id`
- **Authentification** : Authentifiée (propriétaire de la collection)
- **Description** : Met à jour une flashcard

**Route Params** :
- `id` : UUID de la flashcard

**Body** (tous optionnels) :
```json
{
  "frontText": "New Question",
  "backText": "New Answer",
  "frontUrl": "https://...",
  "backUrl": "https://..."
}
```

**Réponse** (200) :
```json
{
  "message": "Card updated",
  "card": {
    "id": "uuid",
    "frontText": "New Question",
    "backText": "New Answer",
    "frontUrl": "...",
    "backUrl": "...",
    "collection": "uuid"
  }
}
```

**Validation Zod** : Champs identiques au POST (optionnels)

**Erreurs** :
- 404 : Card not found
- 403 : Forbidden (pas propriétaire de la collection)
- 400 : No updatable fields provided

---

#### 3.5 Supprimer flashcard
- **Méthode** : `DELETE`
- **Chemin** : `/card/:id`
- **Authentification** : Authentifiée (propriétaire de la collection)
- **Description** : Supprime une flashcard

**Route Params** :
- `id` : UUID de la flashcard

**Réponse** (200) :
```json
{
  "card": {
    "id": "uuid",
    "frontText": "...",
    "backText": "...",
    "collection": "uuid"
  }
}
```

**Erreurs** :
- 404 : Card not found
- 403 : Forbidden

---

### 4. Révisions

#### 4.1 Enregistrer une révision
- **Méthode** : `POST`
- **Chemin** : `/review/:cardId`
- **Authentification** : Authentifiée
- **Description** : Enregistre une révision pour une flashcard. 
  - Accès : propriétaire collection, collection publique, ou admin
  - Le niveau de révision est personnel par utilisateur

**Route Params** :
- `cardId` : UUID de la flashcard

**Body** :
```json
{
  "success": true
}
```

**Réponse (nouvelle révision)** (201) :
```json
{
  "message": "Review recorded",
  "review": {
    "cardId": "uuid",
    "userId": "uuid",
    "level": 1,
    "lastDate": "2026-01-10T12:00:00.000Z",
    "nextReview": "2026-01-11T12:00:00.000Z"
  }
}
```

**Réponse (révision existante mise à jour)** (200) :
```json
{
  "message": "Review updated",
  "review": {
    "cardId": "uuid",
    "userId": "uuid",
    "level": 2,
    "lastDate": "2026-01-10T12:00:00.000Z",
    "nextReview": "2026-01-12T12:00:00.000Z"
  }
}
```

**Validation Zod** : success : boolean



**Erreurs** :
- 401 : Unauthorized
- 403 : Forbidden (collection privée et pas admin)
- 404 : Card not found

---

#### 4.2 Récupérer flashcards à réviser
- **Méthode** : `GET`
- **Chemin** : `/review/collection/:collectionId`
- **Authentification** : Authentifiée
- **Description** : Retourne toutes les flashcards dues pour révision dans une collection. 
  - Accès : propriétaire collection, collection publique, ou admin
  - Retourne uniquement les révisions personnelles de l'utilisateur

**Route Params** :
- `collectionId` : UUID de la collection

**Réponse** (200) :
```json
{
  "cards": [
    {
      "id": "uuid",
      "frontText": "Question",
      "backText": "Réponse",
      "level": 2,
      "lastDate": "2026-01-08T12:00:00.000Z",
      "nextReview": "2026-01-10T12:00:00.000Z"
    }
  ]
}
```

**Note** : 
- Filtre les cartes dont `nextReview <= maintenant`

**Erreurs** :
- 401 : Unauthorized
- 403 : Forbidden (collection privée et pas admin)
- 404 : Collection not found

---

## Authentification

### JWT Bearer Token

Tous les endpoints authentifiés utilisent un **Bearer token JWT** dans l'en-tête `Authorization` :

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Durée de vie** : 24 heures

---

## Codes de statut HTTP

| Code | Signification |
|------|---------------|
| 200  | OK - Requête réussie |
| 201  | Created - Ressource créée |
| 400  | Bad Request - Corps ou paramètres invalides (Zod) |
| 401  | Unauthorized - Token manquant ou invalide |
| 403  | Forbidden - Accès refusé (permissions) |s
| 404  | Not Found - Ressource inexistante |
| 500  | Internal Server Error - Erreur serveur |

---

## Validation Zod

Tous les endpoints utilisent Zod pour valider :
- **Body** : via `validateBody(schema)`
- **Route Params** : via `validateParams(schema)`

En cas d'erreur de validation :

```json
{
  "error": "Invalid body",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "path": ["title"],
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

