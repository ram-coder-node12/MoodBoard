import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import useMoods from '../hooks/useMoods';

const MoodContext = createContext();

export function useMoodState() {
  return useContext(MoodContext);
}

/**
 * Provides the global reactive mood collection and selectedDate 
 * properties to deeply nested consumer components.
 */
export function MoodProvider({ children }) {
  const { currentUser } = useAuth();
  
  // Real-time hook connected to Firestore
  const { moods, loading, error, getMoodForDate } = useMoods(currentUser);
  
  // Format today as YYYY-MM-DD local time
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Magic 'Aura' Engine
  useEffect(() => {
    if (!moods || moods.length === 0) {
      document.body.removeAttribute('data-aura');
      return;
    }
    // Get last 3 valid entries
    const recent = moods.slice(0, 3);
    const avg = recent.reduce((sum, m) => sum + m.level, 0) / recent.length;
    
    let aura = 'neutral';
    if (avg >= 3.8) aura = 'high';
    else if (avg <= 2.2) aura = 'low';

    document.body.setAttribute('data-aura', aura);
  }, [moods]);

  const value = {
    moods,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    getMoodForDate
  };

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
}
