// utils/sessionUtils.js
import { auth } from '../Firebase';

// Call this function when your app starts to detect if it's a fresh browser session
export const detectFreshBrowserSession = () => {
  // Check if this is a fresh browser session (not just navigation)
  const sessionStart = sessionStorage.getItem('sessionStart');
  const appInitialized = sessionStorage.getItem('appInitialized');
  
  if (!sessionStart && !appInitialized) {
    // This is truly a fresh browser session (new tab/window or browser restart)
    sessionStorage.setItem('sessionStart', Date.now().toString());
    sessionStorage.setItem('appInitialized', 'true');
    
    // Check if user was logged in without remember me
    const rememberData = localStorage.getItem('rememberMeData');
    
    // If no remember me data but user is currently logged in, they should be logged out
    if (!rememberData && auth.currentUser) {
      console.log('Logging out user - no remember me data found on fresh session');
      auth.signOut();
    }
  } else if (!appInitialized) {
    // App is being initialized but session exists (navigation within app)
    sessionStorage.setItem('appInitialized', 'true');
  }
};

// Clean up session data on logout
export const cleanupSessionData = () => {
  sessionStorage.removeItem('sessionOnly');
  sessionStorage.removeItem('sessionStart');
  sessionStorage.removeItem('appInitialized');
};

// Call this when user manually logs out
export const handleLogout = () => {
  cleanupSessionData();
  localStorage.removeItem('rememberMeData');
  auth.signOut();
};