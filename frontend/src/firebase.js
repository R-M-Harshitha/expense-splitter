// Import Firebase SDK
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration (REPLACE with your config from Firebase Console!)
const firebaseConfig = {
  apiKey: "AIzaSyDMnNpcVLYCSD_2Pd9ia8I-qm7xLDJEl-Q",
  authDomain: "smartsplit-3a121.firebaseapp.com",
  projectId: "smartsplit-3a121",
  storageBucket: "smartsplit-3a121.firebasestorage.app",
  messagingSenderId: "386825078660",
  appId: "1:386825078660:web:540845166e8b0162a7ffd1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
