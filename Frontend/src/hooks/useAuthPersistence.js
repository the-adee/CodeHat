// hooks/useAuthPersistence.js
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../Firebase';

export const useAuthPersistence = () => {
  useEffect(() => {
    const checkAuthState = () => {
      const rememberData = localStorage.getItem('rememberMeData');
      
      // Only check remember me expiry, don't handle session-only logic here
      if (rememberData) {
        try {
          const { timestamp, rememberMe } = JSON.parse(rememberData);
          const fourteenDaysInMs = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
          const isExpired = Date.now() - timestamp > fourteenDaysInMs;
          
          if (isExpired || !rememberMe) {
            // Clean up expired remember me data and log out
            console.log('Remember me expired - logging out');
            localStorage.removeItem('rememberMeData');
            auth.signOut();
          }
        } catch (error) {
          console.error('Error parsing remember me data:', error);
          localStorage.removeItem('rememberMeData');
          auth.signOut();
        }
      }
    };

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAuthState();
      } else {
        // Clean up when user is logged out
        sessionStorage.removeItem('sessionOnly');
      }
    });

    // Initial check when hook is first used
    checkAuthState();

    return () => unsubscribe();
  }, []);
};