import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMoodState } from '../context/MoodContext';
import { useUserProfile } from '../context/UserContext';
import { createMood, updateMood } from '../services/moodService';
import { saveLetterToFuture, getUnreadLetter, markLetterAsRead } from '../services/lettersService';
import toast from 'react-hot-toast';

import FutureLetterModal from '../components/FutureLetterModal';
import PastLetterModal from '../components/PastLetterModal';
import CopingJarModal from '../components/CopingJarModal';
import LowMoodSupportModal from '../components/LowMoodSupportModal';

const EMOJIS = [
  { level: 1, char: '😞', label: 'Terrible' },
  { level: 2, char: '😕', label: 'Bad' },
  { level: 3, char: '😐', label: 'Okay' },
  { level: 4, char: '🙂', label: 'Good' },
  { level: 5, char: '😄', label: 'Great' }
];

const EMOTIONS = ["happy", "anxious", "tired", "motivated", "sad", "excited", "stressed", "calm", "angry", "grateful"];

const HABITS = [
  { id: 'exercise', label: 'Exercise', emoji: '🏃‍♂️' },
  { id: 'hydration', label: 'Hydration', emoji: '💧' },
  { id: 'healthy_meal', label: 'Healthy Meal', emoji: '🥗' },
  { id: 'meditate', label: 'Meditate', emoji: '🧘' },
  { id: 'reading', label: 'Reading', emoji: '📖' }
];

const MoodLevelButton = React.memo(({ emoji, currentLevel, onSelect }) => {
  const isSelected = currentLevel === emoji.level;
  return (
    <button
      type="button"
      onClick={() => onSelect(emoji.level)}
      className={`flex flex-col items-center p-3 rounded-xl transition-all ${
        isSelected 
        ? 'bg-violet-50 dark:bg-violet-900/30 ring-2 ring-violet-500 transform scale-110' 
        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
      }`}
    >
      <span className="text-4xl sm:text-5xl mb-2">{emoji.char}</span>
      <span className={`text-xs font-medium ${isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-slate-500 dark:text-slate-400'}`}>
        {emoji.label}
      </span>
    </button>
  );
});

const EmotionTag = React.memo(({ emotion, isSelected, onToggle }) => {
  return (
    <button
      type="button"
      onClick={() => onToggle(emotion)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        isSelected 
        ? 'bg-violet-600 text-white' 
        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
      }`}
    >
      {emotion}
    </button>
  );
});

const HabitTag = React.memo(({ habit, isSelected, onToggle }) => {
  return (
    <button
      type="button"
      onClick={() => onToggle(habit.id)}
      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border ${
        isSelected 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400' 
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
      }`}
    >
      <span>{habit.emoji}</span>
      <span>{habit.label}</span>
    </button>
  );
});


export default function LogMood() {
  const { currentUser } = useAuth();
  const { profile } = useUserProfile();
  const { getMoodForDate } = useMoodState();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [targetDateStr, setTargetDateStr] = useState('');
  const [level, setLevel] = useState(null);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [note, setNote] = useState('');
  const [existingId, setExistingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [draftSaved, setDraftSaved] = useState(false);

  // Modal Flow state
  const [pendingFlow, setPendingFlow] = useState(null); // 'futureLetter', 'pastLetter', 'copingJar', 'lowMoodSupport'
  const [pastLetterData, setPastLetterData] = useState(null);
  const [randomCoping, setRandomCoping] = useState(null);

  useEffect(() => {
    const paramDate = searchParams.get('date');
    const todayStr = new Date().toLocaleDateString('en-CA');
    const dateToUse = paramDate || todayStr;
    setTargetDateStr(dateToUse);

    const existingEntry = getMoodForDate(dateToUse);
    if (existingEntry) {
      setExistingId(existingEntry.id);
      setLevel(existingEntry.level);
      setSelectedEmotions(existingEntry.emotions || []);
      setSelectedHabits(existingEntry.habits || []);
      setNote(existingEntry.note || '');
    } else {
      setExistingId(null);
      const strDraft = localStorage.getItem(`moodboard_draft_${dateToUse}`);
      if (strDraft) {
        try {
          const parsed = JSON.parse(strDraft);
          setLevel(parsed.level || null);
          setSelectedEmotions(parsed.selectedEmotions || []);
          setSelectedHabits(parsed.selectedHabits || []);
          setNote(parsed.note || '');
        } catch(e) {}
      } else {
        setLevel(null);
        setSelectedEmotions([]);
        setSelectedHabits([]);
        setNote('');
      }
    }
  }, [searchParams, getMoodForDate]);

  useEffect(() => {
    if (!existingId && targetDateStr && (level !== null || selectedEmotions.length > 0 || selectedHabits.length > 0 || note !== '')) {
      const payload = { level, selectedEmotions, selectedHabits, note };
      localStorage.setItem(`moodboard_draft_${targetDateStr}`, JSON.stringify(payload));
      setDraftSaved(true);
      const timer = setTimeout(() => setDraftSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [level, selectedEmotions, selectedHabits, note, targetDateStr, existingId]);

  const toggleEmotion = useCallback((emotion) => {
    setSelectedEmotions(prev => {
      const newEmotions = prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion];
      setErrors(e => ({...e, emotions: newEmotions.length === 0 ? "Select at least one emotion" : null}));
      return newEmotions;
    });
  }, []);

  const toggleHabit = useCallback((habitId) => {
    setSelectedHabits(prev => prev.includes(habitId) ? prev.filter(h => h !== habitId) : [...prev, habitId]);
  }, []);

  const handleLevelSelect = useCallback((lvl) => {
    setLevel(lvl);
    setErrors(e => ({...e, level: null}));
  }, []);

  const handleNoteChange = useCallback((e) => {
    setNote(e.target.value);
  }, []);

  const processInterception = async () => {
     // No interruption if we are editing an historic mood
     if (existingId) return navigate('/');

     // Positive mood interception -> Future Letter
     if (level >= 4) {
         setPendingFlow('futureLetter');
         return;
     }

     // Level 1 or 2 Interception -> Support flow
     if (level <= 2) {
         try {
            const letter = await getUnreadLetter(currentUser.uid);
            if (letter) {
               setPastLetterData(letter);
            }

            if (profile?.copingJar?.length > 0) {
               const randIndex = Math.floor(Math.random() * profile.copingJar.length);
               setRandomCoping(profile.copingJar[randIndex]);
            }

            setPendingFlow('lowMoodSupport');
            return;
         } catch (e) {
            console.error("Error evaluating unread letters/coping jars", e);
         }
     }

     // Default fallback
     navigate('/');
  };

  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!level) newErrors.level = "Mood level is required.";
    if (selectedEmotions.length === 0) newErrors.emotions = "Select at least one emotion.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return toast.error("Please fill out required fields.");

    try {
      setLoading(true);
      const payload = {
        date: targetDateStr,
        level,
        emotions: selectedEmotions,
        habits: selectedHabits,
        note
      };

      if (existingId) {
        await updateMood(existingId, payload);
        toast.success("Mood updated!");
        navigate('/'); // Do not intercept updates
      } else {
        await createMood(currentUser.uid, payload);
        localStorage.removeItem(`moodboard_draft_${targetDateStr}`);
        toast.success("Mood logged!");
        await processInterception();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save mood.');
    } finally {
      if (pendingFlow === null && !existingId && !targetDateStr) {
         setLoading(false); // Cleanup if navigation fails
      }
    }
  };

  const handleSaveFutureLetter = async (content) => {
      try {
          await saveLetterToFuture(currentUser.uid, content);
          toast.success("Letter sealed. You'll receive it when you need it.");
      } catch (err) {
          toast.error("Failed to save letter.");
      } finally {
          navigate('/');
      }
  };

  const handleClosePastLetter = async () => {
      try {
          if (pastLetterData) await markLetterAsRead(pastLetterData.id);
      } catch (e) { console.error("Failed to mark letter as read", e); }
      navigate('/');
  };

  if (pendingFlow === 'futureLetter') {
      return <FutureLetterModal onSave={handleSaveFutureLetter} onSkip={() => navigate('/')} />;
  }
  if (pendingFlow === 'pastLetter') {
      return <PastLetterModal letter={pastLetterData} onClose={handleClosePastLetter} />;
  }
  if (pendingFlow === 'copingJar') {
      return <CopingJarModal copingMechanism={randomCoping} onClose={() => navigate('/')} />;
  }
  if (pendingFlow === 'lowMoodSupport') {
      return <LowMoodSupportModal letter={pastLetterData} copingMechanism={randomCoping} onClose={handleClosePastLetter} />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 sm:p-10 border border-slate-100 dark:border-slate-700 relative transition-colors">
        <div className="absolute top-6 right-6">
           {draftSaved && !existingId && <span className="text-xs text-slate-400 dark:text-slate-500 font-medium italic transition-opacity">Draft saved...</span>}
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {existingId ? 'Edit Entry' : 'Log your mood'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 border-b border-slate-100 dark:border-slate-700 pb-4">
          Date: <span className="font-semibold text-slate-700 dark:text-slate-300">{targetDateStr && new Date(targetDateStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </p>

        <form onSubmit={handleMoodSubmit} className="space-y-8">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">How are you feeling overall?</label>
            <div className="flex justify-between sm:justify-around text-center">
              {EMOJIS.map((emoji) => (
                <MoodLevelButton 
                   key={emoji.level} 
                   emoji={emoji} 
                   currentLevel={level} 
                   onSelect={handleLevelSelect} 
                />
              ))}
            </div>
            {errors.level && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.level}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Which emotions apply?</label>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map(emotion => (
                <EmotionTag 
                   key={emotion} 
                   emotion={emotion} 
                   isSelected={selectedEmotions.includes(emotion)} 
                   onToggle={toggleEmotion} 
                />
              ))}
            </div>
            {errors.emotions && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.emotions}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">Daily Habits (Optional)</label>
            <div className="flex flex-wrap gap-2">
              {HABITS.map(habit => (
                <HabitTag 
                   key={habit.id} 
                   habit={habit} 
                   isSelected={selectedHabits.includes(habit.id)} 
                   onToggle={toggleHabit} 
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label htmlFor="note" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Write about your day</label>
              <span className={`text-xs ${note.length > 500 ? 'text-red-500 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                {note.length} / 500
              </span>
            </div>
            <textarea
              id="note"
              name="note"
              rows={4}
              maxLength={500}
              value={note}
              onChange={handleNoteChange}
              className="appearance-none block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white transition-colors"
              placeholder="What happened today? Why are you feeling this way?"
            />
          </div>

          <div className="pt-4 flex items-center justify-end border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mr-4 bg-white dark:bg-slate-800 py-2.5 px-5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors"
            >
              {loading ? 'Saving...' : (existingId ? 'Update Entry' : 'Save Entry')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
