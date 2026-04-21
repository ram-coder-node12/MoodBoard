import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { createUserProfile } from '../services/usersService';

const UserContext = createContext();

export function useUserProfile() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(docRef, async (snap) => {
      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        await createUserProfile(currentUser.uid, {
          name: currentUser.displayName || 'User',
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || null
        });
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <UserContext.Provider value={{ profile, loadingProfile: loading }}>
      {children}
    </UserContext.Provider>
  );
}
