import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

export async function saveInsight(userId, weekStart, content) {
  const insightsRef = collection(db, 'insights');
  const payload = {
    userId,
    weekStart,
    content,
    createdAt: serverTimestamp()
  };
  const docRef = await addDoc(insightsRef, payload);
  return docRef.id;
}

export async function getInsightByWeek(userId, weekStart) {
  const insightsRef = collection(db, 'insights');
  const q = query(
    insightsRef,
    where('userId', '==', userId),
    where('weekStart', '==', weekStart)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

export async function getAllInsights(userId) {
  const insightsRef = collection(db, 'insights');
  const q = query(
    insightsRef,
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return data.sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart));
}

/**
 * Mock generator to simulate fetching an AI-generated insight
 */
export async function generateMockAIInsight(moodsArray) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!moodsArray || moodsArray.length === 0) {
        resolve("You haven't logged enough moods this week for an insight. Try logging more often!");
        return;
      }

      // Basic mock logic based on entries
      const averageLevel = moodsArray.reduce((acc, m) => acc + m.level, 0) / moodsArray.length;
      let review = "";
      if (averageLevel >= 4) {
        review = "You've had a **super positive** week! The key emotion driving your days seems to be linked to positive experiences. Keep engaging in activities that bring you joy.";
      } else if (averageLevel <= 2.5) {
        review = "This week looks like it was **challenging** for you. It's perfectly okay to have tough periods. Remember to prioritize self-care and take things one step at a time.";
      } else {
        review = "Your mood was quite **balanced** this week. You navigated through some ups and downs. Consistency in your routine might help maintain this balance.";
      }

      resolve(`Here is your weekly summary:\n\n${review}\n\n*This insight was generated based on ${moodsArray.length} entries this week.*`);
    }, 2000); // Simulate network delay
  });
}
