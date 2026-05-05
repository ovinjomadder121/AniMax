import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, deleteDoc, updateDoc, doc, query, orderBy, onSnapshot, serverTimestamp, getDocFromServer, increment } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId); 
export const googleProvider = new GoogleAuthProvider();

export const ADMIN_EMAIL = 'ovinjomadder@gmail.com';

export const isUserAdmin = (user: User | null) => {
  return user?.email === ADMIN_EMAIL;
};

export { 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  doc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  signInWithPopup,
  onAuthStateChanged,
  increment
};

// Check connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
