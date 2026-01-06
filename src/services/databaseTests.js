

import database from './database';

/**
 * Test user operations
 */
export const testUserOperations = async () => {
  console.log('\n=== Testing User Operations ===');
  
  try {
    // Create user
    console.log('Creating user...');
    const userId = await database.user.createUser(
      'demo@example.com',
      'hashed_password_123',
      'Demo User'
    );
    console.log('✓ User created with ID:', userId);

    // Get user
    console.log('Getting user...');
    const user = await database.user.getUserById(userId);
    console.log('✓ User retrieved:', user);

    // Update user
    console.log('Updating user...');
    await database.user.updateUser(userId, {
      username: 'Updated Demo User',
      phone: '+1234567890',
      address: '123 Demo Street'
    });
    const updatedUser = await database.user.getUserById(userId);
    console.log('✓ User updated:', updatedUser);

    return userId;
  } catch (error) {
    console.error('✗ User operations failed:', error);
    throw error;
  }
};

/**
 * Test product operations
 */
export const testProductOperations = async () => {
  console.log('\n=== Testing Product Operations ===');
  
  try {
    // Mock products
    const mockProducts = [
      {
        id: 1,
        title: 'Test Product 1',
        price: 29.99,
        description: 'A test product',
        category: 'electronics',
        image: 'https://via.placeholder.com/150',
        rating: { rate: 4.5, count: 100 }
      },
      {
        id: 2,
        title: 'Test Product 2',
        price: 49.99,
        description: 'Another test product',
        category: 'clothing',
        image: 'https://via.placeholder.com/150',
        rating: { rate: 4.0, count: 50 }
      }
    ];

    // Cache products
    console.log('Caching products...');
    await database.product.cacheProducts(mockProducts);
    console.log('✓ Products cached');

    // Get products
    console.log('Getting products...');
    const products = await database.product.getCachedProducts();
    console.log('✓ Retrieved', products.length, 'products');

    // Get single product
    const product = await database.product.getProductById(1);
    console.log('✓ Single product:', product);

    return products;
  } catch (error) {
    console.error('✗ Product operations failed:', error);
    throw error;
  }
};

/**
 * Test cart operations
 */
export const testCartOperations = async (userId, products) => {
  console.log('\n=== Testing Cart Operations ===');
  
  try {
    // Add to cart
    console.log('Adding items to cart...');
    await database.cart.addToCart(userId, products[0]);
    await database.cart.addToCart(userId, products[1]);
    console.log('✓ Items added to cart');

    // Get cart items
    console.log('Getting cart items...');
    let cartItems = await database.cart.getCartItems(userId);
    console.log('✓ Cart items:', cartItems);

    // Update quantity
    console.log('Updating quantity...');
    await database.cart.updateCartQuantity(cartItems[0].cartId, 3);
    cartItems = await database.cart.getCartItems(userId);
    console.log('✓ Quantity updated:', cartItems[0]);

    return cartItems;
  } catch (error) {
    console.error('✗ Cart operations failed:', error);
    throw error;
  }
};

/**
 * Test order operations
 */
export const testOrderOperations = async (userId, cartItems) => {
  console.log('\n=== Testing Order Operations ===');
  
  try {
    // Create order
    console.log('Creating order...');
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const order = await database.order.createOrder(
      userId,
      cartItems,
      totalAmount,
      '123 Test Street, Test City'
    );
    console.log('✓ Order created:', order);

    // Get orders
    console.log('Getting user orders...');
    const orders = await database.order.getUserOrders(userId);
    console.log('✓ Orders retrieved:', orders);

    // Update order status
    console.log('Updating order status...');
    await database.order.updateOrderStatus(order.id, 'shipped');
    const updatedOrders = await database.order.getUserOrders(userId);
    console.log('✓ Order status updated:', updatedOrders[0]);

    return order;
  } catch (error) {
    console.error('✗ Order operations failed:', error);
    throw error;
  }
};

/**
 * Test favorites operations
 */
export const testFavoritesOperations = async (userId, products) => {
  console.log('\n=== Testing Favorites Operations ===');
  
  try {
    // Add to favorites
    console.log('Adding to favorites...');
    await database.favorites.addToFavorites(userId, products[0]);
    await database.favorites.addToFavorites(userId, products[1]);
    console.log('✓ Items added to favorites');

    // Get favorites
    console.log('Getting favorites...');
    const favorites = await database.favorites.getFavorites(userId);
    console.log('✓ Favorites:', favorites);

    // Check if favorite
    console.log('Checking if product is favorite...');
    const isFav = await database.favorites.isFavorite(userId, products[0].id);
    console.log('✓ Is favorite:', isFav);

    // Remove from favorites
    console.log('Removing from favorites...');
    await database.favorites.removeFromFavorites(userId, products[0].id);
    const updatedFavorites = await database.favorites.getFavorites(userId);
    console.log('✓ Favorites after removal:', updatedFavorites);

    return updatedFavorites;
  } catch (error) {
    console.error('✗ Favorites operations failed:', error);
    throw error;
  }
};

/**
 * Test database statistics
 */
export const testDatabaseStats = async () => {
  console.log('\n=== Database Statistics ===');
  
  try {
    const stats = await database.utils.getStats();
    console.log('Database Stats:', {
      'Total Users': stats.users,
      'Cached Products': stats.products,
      'Cart Items': stats.cartItems,
      'Orders': stats.orders,
      'Favorites': stats.favorites,
    });
  } catch (error) {
    console.error('✗ Failed to get stats:', error);
  }
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('=================================');
  console.log('Starting Database Tests');
  console.log('=================================');

  try {
    // Initialize database
    console.log('\n=== Initializing Database ===');
    await database.init();
    console.log('✓ Database initialized');

    // Run tests
    const userId = await testUserOperations();
    const products = await testProductOperations();
    const cartItems = await testCartOperations(userId, products);
    await testOrderOperations(userId, cartItems);
    await testFavoritesOperations(userId, products);
    await testDatabaseStats();

    console.log('\n=================================');
    console.log('All Tests Passed! ✓');
    console.log('=================================\n');

    return true;
  } catch (error) {
    console.log('\n=================================');
    console.log('Tests Failed! ✗');
    console.log('=================================\n');
    console.error(error);
    return false;
  }
};

/**
 * Reset database and run tests
 */
export const resetAndTest = async () => {
  console.log('Resetting database...');
  await database.utils.resetDatabase();
  console.log('✓ Database reset complete\n');
  
  return await runAllTests();
};

/**
 * Seed database with sample data
 */
export const seedDatabase = async () => {
  console.log('\n=== Seeding Database ===');
  
  try {
    // Create sample users
    const user1Id = await database.user.createUser('john@example.com', 'hashed_pass1', 'John Doe');
    const user2Id = await database.user.createUser('jane@example.com', 'hashed_pass2', 'Jane Smith');
    console.log('✓ Sample users created');

    // Sample products
    const sampleProducts = [
      {
        id: 1,
        title: 'Laptop',
        price: 999.99,
        description: 'High-performance laptop',
        category: 'electronics',
        image: 'https://via.placeholder.com/300',
        rating: { rate: 4.7, count: 230 }
      },
      {
        id: 2,
        title: 'Smartphone',
        price: 699.99,
        description: 'Latest model smartphone',
        category: 'electronics',
        image: 'https://via.placeholder.com/300',
        rating: { rate: 4.5, count: 450 }
      },
      {
        id: 3,
        title: 'T-Shirt',
        price: 19.99,
        description: 'Comfortable cotton t-shirt',
        category: 'clothing',
        image: 'https://via.placeholder.com/300',
        rating: { rate: 4.2, count: 120 }
      },
    ];

    await database.product.cacheProducts(sampleProducts);
    console.log('✓ Sample products cached');

    // Add some items to cart
    await database.cart.addToCart(user1Id, sampleProducts[0]);
    await database.cart.addToCart(user1Id, sampleProducts[1]);
    console.log('✓ Sample cart items added');

    // Add favorites
    await database.favorites.addToFavorites(user1Id, sampleProducts[0]);
    await database.favorites.addToFavorites(user2Id, sampleProducts[2]);
    console.log('✓ Sample favorites added');

    console.log('\n✓ Database seeded successfully!');
    
    return { user1Id, user2Id };
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    throw error;
  }
};

export default {
  runAllTests,
  resetAndTest,
  seedDatabase,
  testUserOperations,
  testProductOperations,
  testCartOperations,
  testOrderOperations,
  testFavoritesOperations,
  testDatabaseStats,
};
