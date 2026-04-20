import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';

export async function createUserProfile(uid, data) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    uid,
    name: data.name,
    email: data.email,
    photoURL: data.photoURL || null,
    streak: 0,
    longestStreak: 0,
    totalEntries: 0,
    reminderTime: null, // Scaffolding for reminders
    createdAt: serverTimestamp()
  }, { merge: true });
}

export async function getUserProfile(uid) {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

export async function updateUserProfile(uid, data) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, data, { merge: true });
}

function getDaysDiff(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = Math.abs(d2 - d1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function getTodayStr() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export async function updateStreak(uid, moods) {
  if (!moods) return;
  
  // Sort descending
  const sorted = [...moods].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let current = 0;
  let historicalLongest = 0;
  
  const today = getTodayStr();
  let isStreakActive = true;
  let expectedDate = today;

  if (sorted.length > 0) {
    const firstEntry = sorted[0].date;
    if (firstEntry !== today) {
      const prevDate = new Date();
      prevDate.setDate(prevDate.getDate() - 1);
      const yesterdayStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
      
      if (firstEntry !== yesterdayStr) {
        isStreakActive = false;
      } else {
        expectedDate = yesterdayStr;
      }
    }
  } else {
    isStreakActive = false;
  }

  if (isStreakActive) {
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].date === expectedDate) {
        current++;
        const nextD = new Date(expectedDate);
        nextD.setDate(nextD.getDate() - 1);
        expectedDate = `${nextD.getFullYear()}-${String(nextD.getMonth() + 1).padStart(2, '0')}-${String(nextD.getDate()).padStart(2, '0')}`;
      } else if (sorted[i].date < expectedDate) {
        break; // break immediately on jump
      }
    }
  }

  // Calculate Longest Streak natively
  let tempStreak = 0;
  let lastSeenDate = null;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const entryDate = sorted[i].date;
    if (!lastSeenDate) {
      tempStreak = 1;
      historicalLongest = 1;
    } else {
      const diff = getDaysDiff(lastSeenDate, entryDate);
      if (diff === 1) {
        tempStreak++;
        if (tempStreak > historicalLongest) historicalLongest = tempStreak;
      } else if (diff > 1) {
        tempStreak = 1;
      }
    }
    lastSeenDate = entryDate;
  }
  
  const finalLongest = Math.max(historicalLongest, current);

  // Apply to Firebase
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const newLongest = Math.max(userData.longestStreak || 0, finalLongest);
    
    await setDoc(userRef, {
      streak: current,
      longestStreak: newLongest,
      totalEntries: sorted.length
    }, { merge: true });
  }
}
