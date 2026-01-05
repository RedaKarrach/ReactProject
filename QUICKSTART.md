# Quick Start Guide

## Getting Your App Running in 5 Minutes

### Step 1: Navigate to Project Directory
```bash
cd c:\Users\redan\OneDrive\Bureau\ReactProject\ecommerce-app
```

### Step 2: Start the Development Server
```bash
npm start
```

This will open the Expo Developer Tools in your browser.

### Step 3: Choose Your Platform

#### Option A: Run on Physical Device (Easiest)
1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal/browser
3. App will load on your phone

#### Option B: Run on Android Emulator
1. Make sure Android Studio and emulator are installed
2. Start your Android emulator
3. Press `a` in the terminal or click "Run on Android device/emulator"

#### Option C: Run on iOS Simulator (Mac Only)
1. Make sure Xcode is installed
2. Press `i` in the terminal or click "Run on iOS simulator"

#### Option D: Run in Web Browser
1. Press `w` in the terminal or click "Run in web browser"
2. App opens at `http://localhost:19006`

### Step 4: Test the App

**Login Credentials (any email/password works):**
- Email: `test@example.com`
- Password: `password123`

**Or try our team demo accounts:**
- Reda: `reda@ecommerce.com` / `password`
- Achraf: `achraf@ecommerce.com` / `password`
- Sara: `sara@ecommerce.com` / `password`

**Or create a new account:**
1. Click "Sign Up" on login screen
2. Fill in your details
3. Start shopping!

### Step 5: Explore Features

- Browse products  
- View product details  
- Add items to cart  
- Update quantities  
- Place orders  
- View order history  
- Manage profile  

---

## Troubleshooting

### Port Already in Use
```bash
# Kill the process using port 19000
npx kill-port 19000
npm start
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules
npm install
npm start
```

### Cache Issues
```bash
# Clear Expo cache
npx expo start -c
```

---

## Development Tips

### Hot Reloading
- Changes auto-reload in the app
- Shake device or press `Ctrl+M` (Android) / `Cmd+D` (iOS) for dev menu

### Debugging
- Press `j` to open debugger
- Use React DevTools for component inspection

### Code Structure
- Edit screens in `src/screens/`
- Modify components in `src/components/`
- Update styles inline or in component files

---

## Next Steps

1. Customize the UI colors and styles
2. Connect to your own backend API
3. Add payment integration
4. Build for production

---

**Need Help?** Check the main README.md for detailed documentation.

Happy Coding!
