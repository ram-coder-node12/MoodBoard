import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMoodState } from '../context/MoodContext';
import { updateUserProfile } from '../services/usersService';
import useStreak from '../hooks/useStreak';
import toast from 'react-hot-toast';
import { updateProfile } from 'firebase/auth';

export default function Profile() {
  const { currentUser } = useAuth();
  const { moods } = useMoodState();
  const { currentStreak, longestStreak } = useStreak(moods);
  
  const [name, setName] = useState(currentUser?.displayName || '');
  const [saving, setSaving] = useState(false);

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

  const handleDelete = useCallback(() => {
      if (window.confirm("Are you absolutely sure you want to delete your entire account and all mood entries? This cannot be undone.")) {
          toast.error("Delete function mock block: To safely clear Firestore collections + Auth we would ideally deploy a Cloud Function.");
      }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8 animate-fadeIn">
      
      <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8">
         <div className="flex-shrink-0">
             <div className="h-32 w-32 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-5xl border-4 border-white shadow-xl">
               {(currentUser?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
             </div>
         </div>
         <div className="flex-1 text-center md:text-left">
             <h1 className="text-3xl font-extrabold text-slate-900 mb-1">{currentUser?.displayName || 'User'}</h1>
             <p className="text-slate-500 mb-4">{currentUser?.email}</p>
             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
               Member
             </span>
         </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 text-center">
             <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">Entries</p>
             <p className="text-2xl font-bold text-slate-800">{moods.length}</p>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 text-center">
             <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">Streak</p>
             <p className="text-2xl font-bold text-violet-600">{currentStreak}</p>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 text-center">
             <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">Longest</p>
             <p className="text-2xl font-bold text-slate-800">{longestStreak}</p>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 text-center">
             <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">Avg Mood</p>
             <p className="text-2xl font-bold text-green-500">{averageMood}</p>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-100">
         <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">Profile Settings</h2>
         
         <form onSubmit={handleUpdate} className="max-w-md space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Display Name</label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 transition-colors"
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

      {/* Scaffolding: Future Features */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-100">
         <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">Preferences & Data</h2>
         
         <div className="space-y-6 max-w-md">
            <div>
               <div className="flex items-center justify-between">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Daily Reminder Time</label>
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">Coming soon</span>
               </div>
               <input
                 type="time"
                 disabled
                 className="appearance-none block w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm bg-slate-50 text-slate-500 cursor-not-allowed"
               />
               <p className="mt-1 text-xs text-slate-500">Receive a notification to log your mood.</p>
            </div>

            <div className="pt-4">
               <div className="flex items-center justify-between mb-2">
                  <span className="block text-sm font-medium text-slate-700">Export Your Data</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">Coming soon</span>
               </div>
               <button
                 type="button"
                 disabled
                 className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-slate-50 cursor-not-allowed"
               >
                 Export CSV
               </button>
            </div>
         </div>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-xl shadow-sm p-8">
         <h2 className="text-xl font-bold text-red-700 mb-2">Danger Zone</h2>
         <p className="text-red-500 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
         <button
            onClick={handleDelete}
            className="inline-flex justify-center py-2 px-6 border border-red-200 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none transition-colors duration-200"
         >
            Delete Account
         </button>
      </div>

    </div>
  );
}
