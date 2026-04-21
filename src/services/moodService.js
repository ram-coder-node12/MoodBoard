import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { updateStreak } from './usersService';

export async function createMood(userId, data) {
  const moodsRef = collection(db, 'moods');
  const payload = {
    userId,
    date: data.date,
    level: data.level,
    emotions: data.emotions || [],
    habits: data.habits || [],
    note: data.note || '',
    isPublic: false, // Scaffolding
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const docRef = await addDoc(moodsRef, payload);
  const updatedMoods = await getMoodsByUser(userId);
  await updateStreak(userId, updatedMoods);
  return docRef.id;
}

export async function getMoodsByUser(userId) {
  const moodsRef = collection(db, 'moods');
  const q = query(
    moodsRef,
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return data.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getMoodByDate(userId, dateStr) {
  const moodsRef = collection(db, 'moods');
  const q = query(
    moodsRef,
    where('userId', '==', userId),
    where('date', '==', dateStr)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

export async function updateMood(moodId, data) {
  const moodRef = doc(db, 'moods', moodId);
  await updateDoc(moodRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteMood(moodId) {
  const moodRef = doc(db, 'moods', moodId);
  const snap = await getDoc(moodRef);
  if (snap.exists()) {
    const userId = snap.data().userId;
    await deleteDoc(moodRef);
    const updatedMoods = await getMoodsByUser(userId);
    await updateStreak(userId, updatedMoods);
  }
}

export async function getMoodsForRange(userId, startDateStr, endDateStr) {
  const moodsRef = collection(db, 'moods');
  const q = query(
    moodsRef,
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Filter locally to avoid Composite Index requirement
  data = data.filter(m => m.date >= startDateStr && m.date <= endDateStr);
  return data.sort((a, b) => new Date(b.date) - new Date(a.date));
}
