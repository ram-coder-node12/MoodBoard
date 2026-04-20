import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMoodState } from '../context/MoodContext';
import { createMood, updateMood } from '../services/moodService';
import toast from 'react-hot-toast';

const EMOJIS = [
  { level: 1, char: '😞', label: 'Terrible' },
  { level: 2, char: '😕', label: 'Bad' },
  { level: 3, char: '😐', label: 'Okay' },
  { level: 4, char: '🙂', label: 'Good' },
  { level: 5, char: '😄', label: 'Great' }
];

const EMOTIONS = ["happy", "anxious", "tired", "motivated", "sad", "excited", "stressed", "calm", "angry", "grateful"];

const MoodLevelButton = React.memo(({ emoji, currentLevel, onSelect }) => {
  const isSelected = currentLevel === emoji.level;
  return (
    <button
      type="button"
      onClick={() => onSelect(emoji.level)}
      className={`flex flex-col items-center p-3 rounded-xl transition-all ${
        isSelected 
        ? 'bg-violet-50 ring-2 ring-violet-500 transform scale-110' 
        : 'hover:bg-slate-50'
      }`}
    >
      <span className="text-4xl sm:text-5xl mb-2">{emoji.char}</span>
      <span className={`text-xs font-medium ${isSelected ? 'text-violet-700' : 'text-slate-500'}`}>
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
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {emotion}
    </button>
  );
});

export default function LogMood() {
  const { currentUser } = useAuth();
  const { getMoodForDate } = useMoodState();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [targetDateStr, setTargetDateStr] = useState('');
  const [level, setLevel] = useState(null);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [note, setNote] = useState('');
  const [existingId, setExistingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [draftSaved, setDraftSaved] = useState(false);

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
      setNote(existingEntry.note || '');
    } else {
      // Check for Draft
      setExistingId(null);
      const strDraft = localStorage.getItem(`moodboard_draft_${dateToUse}`);
      if (strDraft) {
        try {
          const parsed = JSON.parse(strDraft);
          setLevel(parsed.level || null);
          setSelectedEmotions(parsed.selectedEmotions || []);
          setNote(parsed.note || '');
        } catch(e) {}
      } else {
        setLevel(null);
        setSelectedEmotions([]);
        setNote('');
      }
    }
  }, [searchParams, getMoodForDate]);

  // Save to Draft functionality
  useEffect(() => {
    if (!existingId && targetDateStr && (level !== null || selectedEmotions.length > 0 || note !== '')) {
      const payload = { level, selectedEmotions, note };
      localStorage.setItem(`moodboard_draft_${targetDateStr}`, JSON.stringify(payload));
      setDraftSaved(true);
      const timer = setTimeout(() => setDraftSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [level, selectedEmotions, note, targetDateStr, existingId]);

  const toggleEmotion = useCallback((emotion) => {
    setSelectedEmotions(prev => {
      const newEmotions = prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion];
      setErrors(e => ({...e, emotions: newEmotions.length === 0 ? "Select at least one emotion" : null}));
      return newEmotions;
    });
  }, []);

  const handleLevelSelect = useCallback((lvl) => {
    setLevel(lvl);
    setErrors(e => ({...e, level: null})); // clear error
  }, []);

  const handleNoteChange = useCallback((e) => {
    setNote(e.target.value);
  }, []);

  const handleMoodSubmit = useCallback(async (e) => {
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
        note
      };

      if (existingId) {
        await updateMood(existingId, payload);
        toast.success("Mood updated!");
      } else {
        await createMood(currentUser.uid, payload);
        localStorage.removeItem(`moodboard_draft_${targetDateStr}`);
        toast.success("Mood logged!");
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save mood.');
    } finally {
      setLoading(false);
    }
  }, [level, selectedEmotions, note, targetDateStr, existingId, currentUser, navigate]);

  const navigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm p-6 sm:p-10 border border-slate-100 relative">
        <div className="absolute top-6 right-6">
           {draftSaved && !existingId && <span className="text-xs text-slate-400 font-medium italic transition-opacity">Draft saved...</span>}
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {existingId ? 'Edit Entry' : 'Log your mood'}
        </h1>
        <p className="text-slate-500 mb-8 border-b border-slate-100 pb-4">
          Date: <span className="font-semibold text-slate-700">{targetDateStr && new Date(targetDateStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </p>

        <form onSubmit={handleMoodSubmit} className="space-y-8">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4">How are you feeling overall?</label>
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
            {errors.level && <p className="mt-2 text-sm text-red-600">{errors.level}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Which emotions apply?</label>
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
            {errors.emotions && <p className="mt-2 text-sm text-red-600">{errors.emotions}</p>}
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label htmlFor="note" className="block text-sm font-medium text-slate-700">Write about your day</label>
              <span className={`text-xs ${note.length > 500 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
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
              className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm bg-slate-50 focus:bg-white transition-colors"
              placeholder="What happened today? Why are you feeling this way?"
            />
          </div>

          <div className="pt-4 flex items-center justify-end border-t border-slate-100">
            <button
              type="button"
              onClick={navigateBack}
              className="mr-4 bg-white py-2.5 px-5 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none disabled:bg-slate-400 transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Saving...
                </span>
              ) : (existingId ? 'Update Entry' : 'Save Entry')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
