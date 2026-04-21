import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMoodState } from '../context/MoodContext';
import { useUserProfile } from '../context/UserContext';
import { updateUserProfile } from '../services/usersService';
import useStreak from '../hooks/useStreak';
import toast from 'react-hot-toast';
import { updateProfile } from 'firebase/auth';
import { formatTimeLabel } from '../utils/date';
import { getReminderDescription, getSuggestedReminderTime } from '../utils/reminders';

export default function Profile() {
  const { currentUser } = useAuth();
  const { moods } = useMoodState();
  const { currentStreak, longestStreak } = useStreak(moods);
  
  const [name, setName] = useState(currentUser?.displayName || '');
  const [saving, setSaving] = useState(false);
  const { profile, loadingProfile } = useUserProfile();
  
  const [newCoping, setNewCoping] = useState('');
  const [copingJar, setCopingJar] = useState([]);
  const [savingCoping, setSavingCoping] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [smartRemindersEnabled, setSmartRemindersEnabled] = useState(true);
  const [savingReminder, setSavingReminder] = useState(false);

  useEffect(() => {
    setCopingJar(profile?.copingJar || []);
    setReminderTime(profile?.reminderTime || '20:00');
    setSmartRemindersEnabled(profile?.smartRemindersEnabled ?? true);
  }, [profile]);

  const suggestedReminderTime = getSuggestedReminderTime(moods);
  const reminderDescription = getReminderDescription(
    { ...profile, reminderTime, smartRemindersEnabled },
    moods
  );

  const averageMood = moods.length > 0
    ? (moods.reduce((sum, m) => sum + m.level, 0) / moods.length).toFixed(1)
    : 0;

  const handleUpdate = useCallback(async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be blank");
    
    try {
        setSaving(true);
        await updateProfile(currentUser, { displayName: name });
        await updateUserProfile(currentUser.uid, { name });
        toast.success("Profile updated!");
    } catch(err) {
        toast.error("Failed to update profile.");
    } finally {
        setSaving(false);
    }
  }, [name, currentUser]);

  const handleExportCSV = () => {
    if (moods.length === 0) return toast.error("No data to export");
    
    const headers = "Date,Level,Emotions,Habits,Note\n";
    const csvContent = moods.map(m => {
      const date = m.date;
      const level = m.level;
      const emotions = m.emotions ? `"${m.emotions.join(', ')}"` : '""';
      const habits = m.habits ? `"${m.habits.join(', ')}"` : '""';
      const note = m.note ? `"${m.note.replace(/"/g, '""')}"` : '""';
      return `${date},${level},${emotions},${habits},${note}`;
    }).join("\n");
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `moodboard_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddCoping = async (e) => {
     e.preventDefault();
     const trimmed = newCoping.trim();
     if (!trimmed || !currentUser?.uid) return;
     try {
       setSavingCoping(true);
       const updatedJar = [...copingJar, trimmed];
       setCopingJar(updatedJar);
       await updateUserProfile(currentUser.uid, { copingJar: updatedJar });
       setNewCoping('');
       toast.success("Added to jar!");
     } catch(err) {
       setCopingJar(profile?.copingJar || []);
       toast.error("Failed to add.");
     } finally {
       setSavingCoping(false);
     }
  };

  const handleRemoveCoping = async (itemToRemove) => {
     if (!currentUser?.uid) return;
     try {
       const updatedJar = copingJar.filter(item => item !== itemToRemove);
       setCopingJar(updatedJar);
       await updateUserProfile(currentUser.uid, { copingJar: updatedJar });
       toast.success("Removed from jar.");
     } catch (err) {
       setCopingJar(profile?.copingJar || []);
       toast.error("Failed to remove.");
     }
  };

  const handleDelete = useCallback(() => {
      if (window.confirm("Are you absolutely sure you want to delete your entire account and all mood entries? This cannot be undone.")) {
          toast.error("Delete function mock block: To safely clear Firestore collections + Auth we would ideally deploy a Cloud Function.");
      }
  }, []);

  const handleSaveReminderSettings = async () => {
    if (!currentUser?.uid) return;

    try {
      setSavingReminder(true);
      await updateUserProfile(currentUser.uid, {
        reminderTime,
        smartRemindersEnabled
      });
      toast.success('Reminder settings saved.');
    } catch (error) {
      toast.error('Failed to save reminders.');
    } finally {
      setSavingReminder(false);
    }
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('MoodBoard reminders are on', {
        body: 'We will nudge you when it is time to check in.'
      });
      toast.success('Browser notifications enabled.');
    } else {
      toast.error('Notification permission was not granted.');
    }
  };

  const handleTestReminder = () => {
    const message = reminderDescription;
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('MoodBoard test reminder', { body: message });
    } else {
      toast(message, { icon: '📝' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8 animate-fadeIn">
      
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center md:items-start gap-8 transition-colors">
         <div className="flex-shrink-0">
             <img 
               src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.email}`} 
               alt="Avatar" 
               className="h-32 w-32 rounded-full bg-violet-100 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-xl"
             />
         </div>
         <div className="flex-1 text-center md:text-left">
             <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{currentUser?.displayName || 'User'}</h1>
             <p className="text-slate-500 dark:text-slate-400 mb-4">{currentUser?.email}</p>
             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
               Member
             </span>
         </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 text-center transition-colors">
             <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">Entries</p>
             <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{moods.length}</p>
         </div>
         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 text-center transition-colors">
             <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">Streak</p>
             <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{currentStreak}</p>
         </div>
         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 text-center transition-colors">
             <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">Longest</p>
             <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{longestStreak}</p>
         </div>
         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 text-center transition-colors">
             <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">Avg Mood</p>
             <p className="text-2xl font-bold text-green-500 dark:text-green-400">{averageMood}</p>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 border border-slate-100 dark:border-slate-700 transition-colors">
         <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">Profile Settings</h2>
         
         <form onSubmit={handleUpdate} className="max-w-md space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors"
                />
              </div>
            </div>
            
            <div>
               <button
                 type="submit"
                 disabled={saving}
                 className="w-full sm:w-auto inline-flex justify-center flex-shrink-0 py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none disabled:bg-slate-400 transition-colors"
               >
                 {saving ? 'Saving...' : 'Save Changes'}
               </button>
            </div>
         </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 border border-slate-100 dark:border-slate-700 transition-colors">
         <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">
           <span className="text-2xl">🫙</span>
           <h2 className="text-xl font-bold text-slate-900 dark:text-white">Coping Mechanism Jar</h2>
         </div>
         
         <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Store small acts of self-care here. When you log a difficult day, the app will occasionally reach into your jar and suggest one to help you process your feelings.
         </p>

         <div className="flex flex-wrap gap-2 mb-6">
            {copingJar.map((item, idx) => (
               <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                  {item}
                  <button type="button" onClick={() => handleRemoveCoping(item)} className="ml-2 text-violet-400 hover:text-violet-600 dark:hover:text-violet-200 focus:outline-none">
                     &times;
                  </button>
               </span>
            ))}
            {!loadingProfile && copingJar.length === 0 && (
               <span className="text-sm text-slate-400 italic">Your jar is empty.</span>
            )}
         </div>

         <form onSubmit={handleAddCoping} className="max-w-md flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="newCoping" className="sr-only">Add new coping mechanism</label>
              <input
                id="newCoping"
                type="text"
                value={newCoping}
                onChange={(e) => setNewCoping(e.target.value)}
                placeholder="e.g. Listen to my favorite song..."
                className="appearance-none block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={savingCoping || !newCoping.trim()}
              className="inline-flex justify-center flex-shrink-0 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none disabled:bg-slate-400 transition-colors"
            >
              Add to Jar
            </button>
         </form>
      </div>

      <div id="reminders" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 border border-slate-100 dark:border-slate-700 transition-colors">
         <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">Preferences & Data</h2>
         
         <div className="space-y-6 max-w-md">
            <div>
               <div className="flex items-center justify-between gap-4">
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Smart reminders</label>
                 <label className="inline-flex items-center cursor-pointer">
                   <input
                     type="checkbox"
                     className="sr-only peer"
                     checked={smartRemindersEnabled}
                     onChange={(e) => setSmartRemindersEnabled(e.target.checked)}
                   />
                   <span className="w-11 h-6 bg-slate-200 peer-checked:bg-violet-600 rounded-full relative transition-colors">
                     <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${smartRemindersEnabled ? 'translate-x-5' : ''}`}></span>
                   </span>
                 </label>
               </div>
               <input
                 type="time"
                 value={reminderTime}
                 onChange={(e) => setReminderTime(e.target.value)}
                 disabled={smartRemindersEnabled}
                 className="appearance-none block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-700/50 disabled:text-slate-500 transition-colors"
               />
               <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{reminderDescription}</p>
               <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                 Suggested time from your routine: <span className="font-semibold">{formatTimeLabel(suggestedReminderTime)}</span>
               </p>
               <div className="mt-4 flex flex-wrap gap-3">
                 <button
                   type="button"
                   onClick={handleSaveReminderSettings}
                   disabled={savingReminder}
                   className="inline-flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:bg-slate-400 transition-colors"
                 >
                   {savingReminder ? 'Saving...' : 'Save reminders'}
                 </button>
                 <button
                   type="button"
                   onClick={handleEnableNotifications}
                   className="inline-flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                 >
                   Enable browser alerts
                 </button>
                 <button
                   type="button"
                   onClick={handleTestReminder}
                   className="inline-flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                 >
                   Send test reminder
                 </button>
               </div>
            </div>

            <div className="pt-4">
               <div className="flex items-center justify-between mb-2">
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">Export Your Data</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">Available</span>
               </div>
               <button
                 type="button"
                 onClick={handleExportCSV}
                 className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
               >
                 Export CSV
               </button>
            </div>
         </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl shadow-sm p-8 transition-colors">
         <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Danger Zone</h2>
         <p className="text-red-500 dark:text-red-300 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
         <button
            onClick={handleDelete}
            className="inline-flex justify-center py-2 px-6 border border-red-200 dark:border-red-800 rounded-lg shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/40 focus:outline-none transition-colors duration-200"
         >
            Delete Account
         </button>
      </div>

    </div>
  );
}
