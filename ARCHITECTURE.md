# Architecture SQLite - Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION REACT NATIVE                       │
│                         (Expo Framework)                          │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
         ┌──────────────────┐        ┌──────────────────┐
         │   AuthContext    │        │   CartContext    │
         │                  │        │                  │
         │  - login()       │        │  - addToCart()   │
         │  - register()    │        │  - removeItem()  │
         │  - logout()      │        │  - getItems()    │
         │  - updateProfile │        │  - createOrder() │
         └──────────────────┘        └──────────────────┘
                    │                           │
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │   MODELS LAYER           │
                    │  (src/services/models.js)│
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │ UserModel          │  │
                    │  │ - register()       │  │
                    │  │ - login()          │  │
                    │  │ - getProfile()     │  │
                    │  │ - updateProfile()  │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │ CartModel          │  │
                    │  │ - addItem()        │  │
                    │  │ - getItems()       │  │
                    │  │ - updateQuantity() │  │
                    │  │ - removeItem()     │  │
                    │  │ - clear()          │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │ OrderModel         │  │
                    │  │ - create()         │  │
                    │  │ - getUserOrders()  │  │
                    │  │ - updateStatus()   │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │ ProductModel       │  │
                    │  │ - syncProducts()   │  │
                    │  │ - getAll()         │  │
                    │  │ - getById()        │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │ FavoritesModel     │  │
                    │  │ - add()            │  │
                    │  │ - remove()         │  │
                    │  │ - toggle()         │  │
                    │  │ - getAll()         │  │
                    │  └────────────────────┘  │
                    └──────────────────────────┘
                                  │
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │   DATABASE SERVICE       │
                    │ (src/services/database.js)│
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │ userOperations     │  │
                    │  │ - createUser()     │  │
                    │  │ - getUserByEmail() │  │
                    │  │ - getUserById()    │  │
                    │  │ - updateUser()     │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │ productOperations  │  │
                    │  │ - cacheProducts()  │  │
                    │  │ - getCached()      │  │
                    │  │ - getById()        │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │ cartOperations     │  │
                    │  │ - addToCart()      │  │
                    │  │ - getCartItems()   │  │
                    │  │ - updateQuantity() │  │
                    │  │ - removeFromCart() │  │
                    │  │ - clearCart()      │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │ orderOperations    │  │
                    │  │ - createOrder()    │  │
                    │  │ - getUserOrders()  │  │
                    │  │ - updateStatus()   │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │ favoritesOps       │  │
                    │  │ - addToFavorites() │  │
                    │  │ - remove()         │  │
                    │  │ - getFavorites()   │  │
                    │  │ - isFavorite()     │  │
                    │  └────────────────────┘  │
                    └──────────────────────────┘
                                  │
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │      expo-sqlite          │
                    │   (SQLite Interface)      │
                    └──────────────────────────┘
                                  │
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │   SQLite DATABASE         │
                    │   (ecommerce.db)          │
                    │                           │
                    │   ┌──────────────────┐    │
                    │   │ users            │    │
                    │   │ - id             │    │
                    │   │ - email          │    │
                    │   │ - password       │    │
                    │   │ - username       │    │
                    │   │ - phone          │    │
                    │   │ - address        │    │
                    │   └──────────────────┘    │
                    │                           │
                    │   ┌──────────────────┐    │
                    │   │ products         │    │
                    │   │ - id             │    │
                    │   │ - title          │    │
                    │   │ - price          │    │
                    │   │ - category       │    │
                    │   │ - image          │    │
                    │   └──────────────────┘    │
                    │                           │
                    │   ┌──────────────────┐    │
                    │   │ cart             │    │
                    │   │ - id             │    │
                    │   │ - user_id (FK)   │    │
                    │   │ - product_id     │    │
                    │   │ - quantity       │    │
                    │   └──────────────────┘    │
                    │                           │
                    │   ┌──────────────────┐    │
                    │   │ orders           │    │
                    │   │ - id             │    │
                    │   │ - user_id (FK)   │    │
                    │   │ - order_number   │    │
                    │   │ - total_amount   │    │
                    │   │ - status         │    │
                    │   └──────────────────┘    │
                    │                           │
                    │   ┌──────────────────┐    │
                    │   │ order_items      │    │
                    │   │ - id             │    │
                    │   │ - order_id (FK)  │    │
                    │   │ - product_id     │    │
                    │   │ - quantity       │    │
                    │   └──────────────────┘    │
                    │                           │
                    │   ┌──────────────────┐    │
                    │   │ favorites        │    │
                    │   │ - id             │    │
                    │   │ - user_id (FK)   │    │
                    │   │ - product_id     │    │
                    │   └──────────────────┘    │
                    └──────────────────────────┘

═══════════════════════════════════════════════════════════════

                        DATA FLOW EXAMPLE
                        
User clicks "Add to Cart" on Product
          │
          ▼
    CartContext.addToCart(product)
          │
          ▼
    CartModel.addItem(userId, product)
          │
          ▼
    database.cart.addToCart(userId, product)
          │
          ▼
    expo-sqlite: INSERT INTO cart (...)
          │
          ▼
    SQLite Database: Data saved
          │
          ▼
    Return success
          │
          ▼
    CartContext refreshes cart items
          │
          ▼
    UI updates with new cart count

═══════════════════════════════════════════════════════════════

                    BENEFITS OF THIS ARCHITECTURE

┌─────────────────────────────────────────────────────────────┐
│ ✅ SEPARATION OF CONCERNS                                   │
│    - Contexts handle UI state                               │
│    - Models provide business logic                          │
│    - Database handles data persistence                      │
│                                                              │
│ ✅ TESTABILITY                                              │
│    - Each layer can be tested independently                 │
│    - Mock data easily for unit tests                        │
│                                                              │
│ ✅ MAINTAINABILITY                                          │
│    - Changes in one layer don't affect others               │
│    - Clear responsibility for each module                   │
│                                                              │
│ ✅ PERFORMANCE                                              │
│    - Local database = instant access                        │
│    - No network latency                                     │
│    - Optimized with indexes                                 │
│                                                              │
│ ✅ OFFLINE SUPPORT                                          │
│    - Works without internet                                 │
│    - Data persists across sessions                          │
│    - Sync with backend when online (future)                 │
│                                                              │
│ ✅ SCALABILITY                                              │
│    - Easy to add new models/operations                      │
│    - Database can handle thousands of records               │
│    - Ready for backend integration                          │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════

                    FUTURE ENHANCEMENTS

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  Backend API                                                 │
│      │                                                       │
│      ▼                                                       │
│  Sync Service                                                │
│      │                                                       │
│      ├──► Local SQLite (Current)                            │
│      │                                                       │
│      └──► Cloud Database (Future)                           │
│                                                              │
│  Features to Add:                                            │
│  - Background sync                                           │
│  - Conflict resolution                                       │
│  - Real-time updates                                         │
│  - Cloud backup                                              │
│  - Multi-device sync                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Légende

```
┌─────┐   ┌─────┐
│ Box │ = │Module│  Composant ou module du système
└─────┘   └─────┘

   │           
   ▼           Connection/Flow de données
   
(FK)         = Foreign Key (clé étrangère)

═══          = Séparateur de section

```

## Points Clés

1. **Architecture en Couches**
   - UI Layer (Contexts)
   - Business Logic (Models)
   - Data Access (Database Service)
   - Storage (SQLite)

2. **Flux de Données Unidirectionnel**
   - UI → Context → Model → Database → SQLite
   - Pas de court-circuit entre les couches

3. **Séparation des Responsabilités**
   - Chaque couche a un rôle spécifique
   - Facilite les tests et la maintenance

4. **Évolutivité**
   - Facile d'ajouter de nouvelles fonctionnalités
   - Prêt pour l'intégration backend
