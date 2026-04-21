import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

export async function saveLetterToFuture(userId, content) {
  const lettersRef = collection(db, 'letters');
  const payload = {
    userId,
    content,
    isRead: false,
    createdAt: serverTimestamp()
  };
  const docRef = await addDoc(lettersRef, payload);
  return docRef.id;
}

export async function getUnreadLetter(userId) {
  const lettersRef = collection(db, 'letters');
  const q = query(
    lettersRef,
    where('userId', '==', userId),
    where('isRead', '==', false)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  // Return the first unread letter (oldest conceptually)
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

export async function markLetterAsRead(letterId) {
  const letterRef = doc(db, 'letters', letterId);
  await updateDoc(letterRef, {
    isRead: true,
    readAt: serverTimestamp()
  });
}
