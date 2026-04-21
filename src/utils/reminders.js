import { formatDateKey, formatTimeLabel } from './date';

export function getSuggestedReminderTime(moods) {
  const hourCounts = moods.reduce((acc, mood) => {
    const hour = mood.createdAt?.toDate?.().getHours?.();
    if (Number.isInteger(hour)) {
      acc[hour] = (acc[hour] || 0) + 1;
    }
    return acc;
  }, {});

  const bestHour = Object.entries(hourCounts)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return Number(a[0]) - Number(b[0]);
    })[0]?.[0];

  const hour = bestHour ? Number(bestHour) : 20;
  return `${String(hour).padStart(2, '0')}:00`;
}

export function getActiveReminderTime(profile, moods) {
  if (profile?.smartRemindersEnabled) {
    return getSuggestedReminderTime(moods);
  }

  return profile?.reminderTime || null;
}

export function getReminderDescription(profile, moods) {
  const timeValue = getActiveReminderTime(profile, moods);
  if (!timeValue) {
    return 'No reminder is active yet.';
  }

  if (profile?.smartRemindersEnabled) {
    return `Smart reminders will nudge you around ${formatTimeLabel(timeValue)} based on when you usually log.`;
  }

  return `Daily reminder scheduled for ${formatTimeLabel(timeValue)}.`;
}

export function shouldSendReminder({ profile, moods, currentUser }) {
  if (!currentUser?.uid) return false;

  const timeValue = getActiveReminderTime(profile, moods);
  if (!timeValue) return false;

  const todayKey = formatDateKey();
  const alreadyLoggedToday = moods.some((mood) => mood.date === todayKey);
  if (alreadyLoggedToday) return false;

  const [hours, minutes] = timeValue.split(':').map(Number);
  const now = new Date();
  const dueTime = new Date();
  dueTime.setHours(hours, minutes || 0, 0, 0);

  if (now < dueTime) return false;

  const reminderKey = `moodboard_reminder_${currentUser.uid}_${todayKey}`;
  return !localStorage.getItem(reminderKey);
}

export function markReminderSent(currentUser) {
  if (!currentUser?.uid) return;
  localStorage.setItem(`moodboard_reminder_${currentUser.uid}_${formatDateKey()}`, 'sent');
}
