// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat SDK is v9-compat
const firebaseConfig = {
  apiKey: 'AIzaSyCVHiTHx4Lf50ikO5rQRU0-t8s-V0n6Znw',
  authDomain: 'web-app-analytics-eb8eb.firebaseapp.com',
  projectId: 'web-app-analytics-eb8eb',
  storageBucket: 'web-app-analytics-eb8eb.firebasestorage.app',
  messagingSenderId: '420073634515',
  appId: '1:420073634515:web:32a1a5ce56c85392437226',
  measurementId: 'G-NEHP5VRGRE'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics and get a reference to the service
let analytics = null;

// Only initialize analytics in browser environment and if measurement ID is provided
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  analytics = getAnalytics(app);
  console.log(analytics);
  
}

export { analytics };
export default app;
