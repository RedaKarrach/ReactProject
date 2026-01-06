# Guide de Démarrage Rapide - SQLite Integration

## Installation Complétée ✅

Votre application e-commerce dispose maintenant d'une base de données SQLite complète!

### Fichiers Créés

1. **`src/services/database.js`** - Service principal de base de données
   - 6 tables (users, products, cart, orders, order_items, favorites)
   - Index optimisés pour les performances
   - Opérations CRUD complètes

2. **`src/services/models.js`** - Modèles de haut niveau
   - UserModel, ProductModel, CartModel, OrderModel, FavoritesModel
   - API propre et facile à utiliser

3. **`src/utils/auth.js`** - Utilitaires d'authentification
   - Hachage de mots de passe
   - Validation email et mot de passe

4. **`src/services/databaseTests.js`** - Tests et démonstrations
   - Tests automatisés
   - Seed data pour démo

5. **`DATABASE.md`** - Documentation complète
   - Schéma de base de données
   - Guide d'utilisation
   - Exemples de code

## Changements dans les Contextes

### ✅ AuthContext
- Inscription et connexion via SQLite
- Mots de passe hachés
- Initialisation automatique de la base de données

### ✅ CartContext
- Panier persistant par utilisateur
- Synchronisation automatique avec la base de données
- Support du mode déconnecté

## Test de l'Application

### 1. Lancer l'application
```bash
npm start
```

### 2. Créer un compte
1. Ouvrez l'application
2. Cliquez sur "S'inscrire"
3. Entrez vos informations
4. Le compte est créé dans la base SQLite!

### 3. Tester le panier
1. Connectez-vous
2. Ajoutez des produits au panier
3. Fermez et rouvrez l'app
4. Le panier est toujours là! ✨

## Tests de la Base de Données

### Option 1: Tests Automatiques
Créez un fichier test dans votre projet:

```javascript
// testDB.js
import dbTests from './src/services/databaseTests';

// Exécuter tous les tests
dbTests.runAllTests();

// Ou réinitialiser et tester
dbTests.resetAndTest();

// Ou juste remplir avec des données de démo
dbTests.seedDatabase();
```

### Option 2: Tests Manuels

1. **Créer un utilisateur:**
```javascript
import { UserModel } from './src/services/models';

const user = await UserModel.register(
  'test@example.com',
  'password123',
  'Test User'
);
```

2. **Se connecter:**
```javascript
const user = await UserModel.login(
  'test@example.com',
  'password123'
);
```

3. **Gérer le panier:**
```javascript
import { CartModel } from './src/services/models';

// Ajouter au panier
await CartModel.addItem(userId, product);

// Voir le panier
const items = await CartModel.getItems(userId);

// Vider le panier
await CartModel.clear(userId);
```

## Vérification de la Base de Données

### Voir les Statistiques
```javascript
import database from './src/services/database';

const stats = await database.utils.getStats();
console.log(stats);
// Affiche: { users: X, products: Y, cartItems: Z, orders: A, favorites: B }
```

### Réinitialiser la Base de Données (Development)
```javascript
import database from './src/services/database';

// Tout supprimer et recommencer
await database.utils.resetDatabase();
```

## Structure de la Base de Données

### Tables Principales

#### users
- id, email, password (haché), username, phone, address
- Stocke tous les utilisateurs de l'app

#### products
- id, title, price, description, category, image, rating
- Cache des produits de l'API

#### cart
- id, user_id, product_id, title, price, image, quantity
- Panier de chaque utilisateur

#### orders
- id, user_id, order_number, total_amount, status, shipping_address
- Historique des commandes

#### order_items
- id, order_id, product_id, title, price, quantity, image
- Détails de chaque commande

#### favorites
- id, user_id, product_id, title, price, image
- Produits favoris

## Fonctionnalités

### ✅ Ce qui fonctionne maintenant:

1. **Authentification**
   - Inscription avec email/password
   - Connexion avec vérification
   - Mots de passe hachés
   - Session persistante

2. **Panier**
   - Ajout/suppression d'articles
   - Mise à jour des quantités
   - Persistance par utilisateur
   - Synchronisation automatique

3. **Commandes**
   - Création de commandes
   - Historique complet
   - Statut des commandes
   - Détails des articles

4. **Favoris**
   - Ajouter/retirer des favoris
   - Liste des favoris par utilisateur
   - Persistance

5. **Produits**
   - Cache local pour offline
   - Synchronisation avec l'API
   - Recherche rapide

## Débogage

### Voir les Logs
Tous les services utilisent console.log/console.error:
```
✓ Database initialized successfully
✓ User created with ID: 1
✓ Products cached
✗ Error: Invalid credentials
```

### Inspecter la Base de Données

1. Trouvez le fichier `ecommerce.db` dans:
   - iOS: `~/Library/Developer/CoreSimulator/...`
   - Android: `/data/data/...`

2. Utilisez un outil comme **DB Browser for SQLite**

## Prochaines Étapes

### Recommandations de Production

1. **Sécurité**
   - Remplacer le hachage simple par bcrypt ou expo-crypto
   - Ajouter le chiffrement de la base de données
   - Implémenter 2FA

2. **Performance**
   - Ajouter la pagination pour les grandes listes
   - Implémenter le cache intelligent
   - Optimiser les requêtes

3. **Synchronisation**
   - Ajouter un backend
   - Implémenter la synchronisation cloud
   - Gérer les conflits

4. **Fonctionnalités**
   - Recherche de produits
   - Filtres et tri
   - Notifications push
   - Paiements

## Support

Pour toute question ou problème:

1. Consultez [DATABASE.md](DATABASE.md) pour la documentation complète
2. Vérifiez les logs de la console
3. Testez avec `databaseTests.js`

## Résumé

Votre application dispose maintenant de:
- ✅ Base de données SQLite complète
- ✅ 6 tables optimisées avec index
- ✅ Modèles de données propres
- ✅ Tests automatisés
- ✅ Documentation complète
- ✅ Intégration avec les contextes existants

**Tout est prêt pour le développement! 🚀**
