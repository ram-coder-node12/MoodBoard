import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function useMoods(currentUser) {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setMoods([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'moods'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        let moodsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort natively avoiding Google Cloud composite indexes
        moodsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setMoods(moodsData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching moods:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const getMoodForDate = useMemo(() => {
    return (dateStr) => moods.find(m => m.date === dateStr) || null;
  }, [moods]);

  return { moods, loading, error, getMoodForDate };
}
