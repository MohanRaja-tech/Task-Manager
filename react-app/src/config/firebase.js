// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.log("Analytics not supported in this environment");
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Basic configuration - will be updated with correct client ID
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Add additional scopes
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Google Sign In function with comprehensive error handling
export const signInWithGoogle = async () => {
  try {
    console.log('🔐 Starting Google sign-in process...');
    
    // Clear any existing auth state
    if (auth.currentUser) {
      console.log('📝 Clearing existing auth state...');
      await signOut(auth);
    }
    
    console.log('🚀 Opening Google sign-in popup...');
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    console.log('✅ Google sign-in successful for:', user.email);
    console.log('🎫 Getting ID token...');
    
    const idToken = await user.getIdToken(true); // Force refresh
    
    console.log('🎉 ID Token obtained successfully, length:', idToken.length);
    
    // Debug: Decode token header to see the issuer information
    try {
      const tokenParts = idToken.split('.');
      if (tokenParts.length === 3) {
        const header = JSON.parse(atob(tokenParts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
        console.log('🔍 Token Debug Info:');
        console.log('   Algorithm:', header.alg);
        console.log('   Key ID:', header.kid);
        console.log('   Token Type:', header.typ);
        console.log('   Audience (aud):', payload.aud);
        console.log('   Issuer (iss):', payload.iss);
        console.log('   Subject (sub):', payload.sub);
      }
    } catch (decodeError) {
      console.warn('⚠️ Could not decode token for debugging:', decodeError);
    }
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      },
      idToken: idToken
    };
  } catch (error) {
    console.error('❌ Google sign in error:', error);
    
    // Handle specific error codes
    let errorMessage = 'Google authentication failed';
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in was cancelled by user';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Pop-up blocked by browser. Please allow pop-ups and try again';
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = 'Sign-in request was cancelled';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your internet connection';
        break;
      case 'auth/invalid-api-key':
        errorMessage = 'Invalid API key configuration';
        break;
      case 'auth/unauthorized-domain':
        errorMessage = 'This domain is not authorized for OAuth operations';
        break;
      default:
        errorMessage = error.message || 'Google authentication failed';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Sign out function
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('🚪 User signed out successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Sign out error:', error);
    return { success: false, error: error.message };
  }
};

export default app;
