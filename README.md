# E-Commerce Mobile App

A modern, production-quality e-commerce mobile application built with React Native and Expo. This app demonstrates enterprise-level architecture, clean code practices, and a polished user experience suitable for real-world deployment.

![React Native](https://img.shields.io/badge/React%20Native-0.76-blue)
![Expo](https://img.shields.io/badge/Expo-SDK%2052-000020)
![License](https://img.shields.io/badge/License-MIT-green)

## Development Team

**Built by:**
- **Reda Karrach** - Lead Developer & Project Architect
- **Achraf Oubakouz** - Frontend Specialist & UI/UX Designer
- **Sara Bellaly** - Backend Integration & QA Engineer

> See [CONTRIBUTORS.md](CONTRIBUTORS.md) for detailed team contributions.

---

## Screenshots

> This is a fully functional e-commerce application with authentication, product browsing, cart management, and order tracking.

## Features

### Authentication
- **User Registration** - Create new account with email validation
- **User Login** - Secure authentication with password protection
- **Persistent Sessions** - Auto-login using AsyncStorage
- **Logout** - Clean session management

### Product Management
- **Product Listing** - Browse all products with beautiful cards
- **Product Details** - Detailed view with images, description, and ratings
- **Categories** - Organized product categorization
- **Pull to Refresh** - Update product list dynamically
- **Loading States** - Smooth loading indicators

### Shopping Cart
- **Add to Cart** - Add products with quantity selection
- **Update Quantity** - Increment/decrement item quantities
- **Remove Items** - Delete individual items from cart
- **Cart Persistence** - Cart saved locally across sessions
- **Real-time Total** - Live calculation of cart total
- **Cart Badge** - Visual indicator showing item count

### Order Management
- **Create Orders** - Place orders from cart
- **Order History** - View all past orders
- **Order Details** - Track order status and items
- **Order Persistence** - Orders saved locally

### User Profile
- **Profile View** - Display user information
- **Edit Profile** - Update user details
- **Settings Menu** - Quick access to app features
- **Account Management** - Full control over user account

## Architecture

### Project Structure
```
ecommerce-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ProductCard.js
│   │   ├── Header.js
│   │   ├── Button.js
│   │   ├── Input.js
│   │   └── Loader.js
│   │
│   ├── screens/            # Application screens
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ProductDetailsScreen.js
│   │   ├── CartScreen.js
│   │   ├── ProfileScreen.js
│   │   └── OrdersScreen.js
│   │
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── TabNavigator.js
│   │
│   ├── context/           # State management with Context API
│   │   ├── AuthContext.js
│   │   └── CartContext.js
│   │
│   ├── services/          # API and storage services
│   │   ├── api.js
│   │   └── storage.js
│   │
│   ├── hooks/             # Custom React hooks
│   │   └── useFetch.js
│   │
│   └── assets/           # Images and icons
│       ├── images/
│       └── icons/
│
├── App.js                # Application entry point
├── package.json          # Dependencies
└── README.md            # Documentation
```

### Design Patterns

#### **Context API for State Management**
- Clean separation of concerns
- Global state accessible throughout the app
- Optimized re-renders with proper context splitting

#### **Service Layer Architecture**
- API calls abstracted into service modules
- Storage operations centralized
- Easy to swap implementations

#### **Component-Based Design**
- Highly reusable components
- Consistent UI patterns
- Props-driven customization

#### **Custom Hooks**
- Encapsulated business logic
- Reusable data fetching
- Clean component code

## Tech Stack

### Core
- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tooling
- **JavaScript (ES6+)** - Modern JavaScript features

### Navigation
- **React Navigation v6** - Navigation library
- **Stack Navigator** - Screen transitions
- **Bottom Tab Navigator** - Tab-based navigation

### State Management
- **React Context API** - Global state management
- **React Hooks** - Local state and side effects

### Data & Storage
- **SQLite (expo-sqlite)** - Local database for data persistence
- **Axios** - HTTP client for API requests
- **AsyncStorage** - Fallback storage solution
- **Fake Store API** - Product data source

### UI/UX
- **React Native Safe Area Context** - Safe area handling
- **React Native Gesture Handler** - Touch gestures
- **Custom Components** - Tailored UI elements

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (optional, for global installation)
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ecommerce-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Run on your device**
   - **iOS Simulator** (Mac only):
     ```bash
     npm run ios
     ```
   - **Android Emulator**:
     ```bash
     npm run android
     ```
   - **Web Browser**:
     ```bash
     npm run web
     ```
   - **Physical Device**: Scan the QR code with Expo Go app

### Quick Test
Use any email and password (minimum 6 characters) to test the app:
- Email: `test@example.com`
- Password: `password123`

**Team Demo Accounts:**
- Reda Karrach: `reda@ecommerce.com` / `password`
- Achraf Oubakouz: `achraf@ecommerce.com` / `password`
- Sara Bellaly: `sara@ecommerce.com` / `password`

## 📋 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser

## 🗄️ Database

This app uses **SQLite** (via expo-sqlite) for robust local data persistence. See [DATABASE.md](DATABASE.md) for complete documentation.

### Database Features
- ✅ User authentication with hashed passwords
- ✅ Product caching for offline access
- ✅ Persistent shopping cart per user
- ✅ Complete order history
- ✅ Favorites management
- ✅ Optimized with indexes for performance

### Quick Database Overview

**Tables:**
- `users` - User accounts and profiles
- `products` - Cached product data
- `cart` - Shopping cart items
- `orders` - Order history
- `order_items` - Order line items
- `favorites` - User favorites

**Testing Database:**
```javascript
import dbTests from './src/services/databaseTests';

// Run all tests
await dbTests.runAllTests();

// Seed with sample data
await dbTests.seedDatabase();

// Reset database
await dbTests.resetAndTest();
```

For full details, see [DATABASE.md](DATABASE.md)

## Key Features Breakdown

### Authentication Flow
1. User opens app → Check stored credentials
2. If authenticated → Navigate to Home
3. If not → Show Login/Register screens
4. After login → Save credentials and navigate to Home

### Shopping Flow
1. Browse products on Home screen
2. Tap product → View details
3. Add to cart with quantity
4. View cart → Update quantities
5. Checkout → Create order
6. View order history

### State Management
- **AuthContext**: User authentication state with SQLite integration
- **CartContext**: Shopping cart operations with database persistence
- **Database Service**: Centralized SQLite operations
- **Models Layer**: High-level API for database interactions

## Security Considerations

### Current Implementation
- ✅ Password hashing before database storage
- ✅ Password masking in input fields
- ✅ Token-based authentication
- ✅ Secure local database storage
- ✅ User data isolation with foreign keys

### Production Recommendations
- Implement production-grade password hashing (bcrypt/expo-crypto)
- Use secure storage libraries (react-native-keychain)
- Add refresh token mechanism
- Implement HTTPS-only API calls
- Add input sanitization and validation
- Implement rate limiting
- Enable database encryption
- Add two-factor authentication (2FA)

## API Integration

### Current Setup
- Using **Fake Store API** (https://fakestoreapi.com) for product data
- SQLite database for all user data (auth, cart, orders)
- Hybrid approach: API for products, local DB for user operations
- Product caching for offline access

### Products API
```javascript
GET /products           // Get all products (cached to DB)
GET /products/{id}      // Get single product
GET /products/categories // Get all categories
```

### Database Operations
```javascript
// All local operations via SQLite:
- User registration & login
- Cart management
- Order creation & history
- Favorites management
```

### Extending the API
To integrate a real backend:

1. Update `src/services/api.js` with your API base URL
2. Implement real authentication endpoints
3. Add database sync mechanism
4. Update models to sync with backend
5. Add proper error handling and retry logic

## UI/UX Features

- **Modern Design**: Clean, minimalist interface
- **Responsive Layout**: Adapts to different screen sizes
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Empty States**: Informative empty views
- **Pull to Refresh**: Refresh product listings
- **Optimistic Updates**: Instant UI feedback
- **Tab Navigation**: Easy access to main features
- **Cart Badge**: Visual cart item counter

## Future Enhancements

### High Priority
1. **Payment Integration**
   - Stripe integration
   - PayPal support
   - Credit card processing
   - Payment confirmation screens

2. **Real Backend Migration**
   - User authentication API
   - Product management API
   - Order processing API
   - Push notifications

3. **Enhanced Features**
   - Product search and filters
   - Wishlist functionality
   - Product reviews and ratings
   - Order tracking with status updates
   - Multiple shipping addresses

### Medium Priority
4. **Performance Optimization**
   - Image lazy loading
   - Product list virtualization
   - Caching strategies
   - Bundle size optimization

5. **User Experience**
   - Dark mode support
   - Multi-language support
   - Onboarding tutorial
   - Biometric authentication

6. **Social Features**
   - Social login (Google, Facebook)
   - Share products
   - Referral program

### Low Priority
7. **Analytics & Monitoring**
   - User behavior tracking
   - Crash reporting
   - Performance monitoring
   - A/B testing framework

8. **Advanced Features**
   - AR product preview
   - Voice search
   - Chatbot support
   - Personalized recommendations

## Testing

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Register new account
- [ ] Browse products
- [ ] View product details
- [ ] Add items to cart
- [ ] Update cart quantities
- [ ] Remove items from cart
- [ ] Place an order
- [ ] View order history
- [ ] Logout and re-login
- [ ] Test offline behavior

### Automated Testing (Recommended)
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react-native jest

# Run tests
npm test
```

## Deployment

### Build for Production

**iOS (requires Mac)**
```bash
expo build:ios
```

**Android**
```bash
expo build:android
```

### App Store Submission
1. Configure app.json with proper metadata
2. Prepare screenshots and descriptions
3. Build production version
4. Submit to App Store/Play Store
5. Handle review feedback

## Contributing

This is a portfolio/learning project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Development Team

This project was built by a talented team of developers:

**Reda Karrach** - Lead Developer & Project Architect  
- Full-stack development
- System architecture
- State management & navigation

**Achraf Oubakouz** - Frontend Developer  
- UI/UX implementation
- Component design
- API integration

**Sara Bellaly** - Backend Integration Specialist  
- Service layer development
- Data persistence
- Testing & quality assurance

*Built with passion and expertise in React Native and modern mobile development practices.*

**Development Team:**
- **Reda Karrach** - Lead Developer & Architect
- **Achraf Oubakouz** - Frontend Specialist
- **Sara Bellaly** - Backend & QA Engineer

## Acknowledgments

- **Fake Store API** for product data
- **React Navigation** for routing
- **Expo** for amazing development experience
- React Native community for excellent libraries

## Support

For questions or issues:
- Open an issue in the repository
- Check existing documentation
- Review code comments

---

**Note**: This is a demonstration application showcasing modern React Native development. For production use, implement proper backend services, security measures, and thorough testing.

---

**Made with React Native**

*Developed by Reda Karrach, Achraf Oubakouz, and Sara Bellaly*  
*January 2026*
