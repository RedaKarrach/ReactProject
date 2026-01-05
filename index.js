/**
 * E-Commerce Mobile Application - Main Entry Point
 * 
 * @project E-Commerce App
 * @version 1.0.0
 * @license MIT
 * 
 * @team
 * - Reda Karrach (Lead Developer & Architect)
 * - Achraf Oubakouz (Frontend Specialist & UI/UX)
 * - Sara Bellaly (Backend Integration & QA)
 * 
 * @created January 2026
 * 
 * This application demonstrates production-quality React Native development
 * with clean architecture, state management, and real-world e-commerce features.
 * 
 * Built with ❤️ using React Native and Expo
 */

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
