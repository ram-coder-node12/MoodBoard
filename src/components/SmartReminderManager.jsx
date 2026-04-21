import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useMoodState } from '../context/MoodContext';
import { useUserProfile } from '../context/UserContext';
import { getReminderDescription, shouldSendReminder, markReminderSent } from '../utils/reminders';

export default function SmartReminderManager() {
  const { currentUser } = useAuth();
  const { moods } = useMoodState();
  const { profile } = useUserProfile();

  useEffect(() => {
    if (!currentUser || !profile) return undefined;

    const maybeSendReminder = () => {
      if (!shouldSendReminder({ profile, moods, currentUser })) return;

      const message = getReminderDescription(profile, moods);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('MoodBoard check-in', {
          body: message
        });
      } else {
        toast(message, { icon: '📝' });
      }

      markReminderSent(currentUser);
    };

    maybeSendReminder();
    const interval = window.setInterval(maybeSendReminder, 60000);
    return () => window.clearInterval(interval);
  }, [currentUser, profile, moods]);

  return null;
}
