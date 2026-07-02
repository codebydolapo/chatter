import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

export const syncUserProfile = async (user: any) => {
  const userRef = doc(db, 'users', user.uid);
  
  await setDoc(userRef, {
    uid: user.uid,
    // FORCE LOWERCASE HERE TO MATCH YOUR SEARCH QUERY
    email: user.email ? user.email.trim().toLowerCase() : '', 
    displayName: user.displayName || user.email.split('@')[0],
    photoURL: user.photoURL || null,
    lastSeen: serverTimestamp()
  }, { merge: true });
};

// Search a user by their exact email string
export const searchUserByEmail = async (email: string): Promise<UserProfile | null> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;
  
  const docData = querySnapshot.docs[0].data();
  return {
    uid: docData.uid,
    email: docData.email,
    displayName: docData.displayName,
    photoURL: docData.photoURL
  };
};

// Add a target user profile to the current active user's contact list
export const addContact = async (currentUserUid: string, contact: UserProfile) => {
  const contactDocRef = doc(db, 'users', currentUserUid, 'contacts', contact.uid);
  await setDoc(contactDocRef, {
    uid: contact.uid,
    displayName: contact.displayName,
    email: contact.email,
    photoURL: contact.photoURL,
    addedAt: serverTimestamp()
  });
};

