import React, { createContext, useContext, useState } from 'react';
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
