import React, { useMemo, useState } from 'react';
import { useMoodState } from '../context/MoodContext';
import MoodCard from '../components/MoodCard';

export default function Journal() {
  const { moods, loading } = useMoodState();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');
  const [emotion, setEmotion] = useState('all');
  const [habit, setHabit] = useState('all');

  const emotions = useMemo(() => {
    return [...new Set(moods.flatMap((mood) => mood.emotions || []))].sort();
  }, [moods]);

  const habits = useMemo(() => {
    return [...new Set(moods.flatMap((mood) => mood.habits || []))].sort();
  }, [moods]);

  const filteredMoods = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return moods.filter((mood) => {
      const matchesQuery = !normalized || [
        mood.date,
        mood.note || '',
        ...(mood.emotions || []),
        ...(mood.habits || [])
      ].join(' ').toLowerCase().includes(normalized);

      const matchesLevel = level === 'all' || String(mood.level) === level;
      const matchesEmotion = emotion === 'all' || (mood.emotions || []).includes(emotion);
      const matchesHabit = habit === 'all' || (mood.habits || []).includes(habit);

      return matchesQuery && matchesLevel && matchesEmotion && matchesHabit;
    });
  }, [moods, query, level, emotion, habit]);

  const clearFilters = () => {
    setQuery('');
    setLevel('all');
    setEmotion('all');
    setHabit('all');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Journal Search</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Search your notes and filter by mood, emotions, or habits to spot patterns faster.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 space-y-4">
        <div>
          <label htmlFor="journal-search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Search entries
          </label>
          <input
            id="journal-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, dates, emotions, or habits"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="all">All mood levels</option>
            <option value="1">Terrible</option>
            <option value="2">Bad</option>
            <option value="3">Okay</option>
            <option value="4">Good</option>
            <option value="5">Great</option>
          </select>

          <select value={emotion} onChange={(e) => setEmotion(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="all">All emotions</option>
            {emotions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select value={habit} onChange={(e) => setHabit(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="all">All habits</option>
            {habits.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {loading ? 'Loading entries...' : `${filteredMoods.length} matching entr${filteredMoods.length === 1 ? 'y' : 'ies'}`}
        </p>
      </div>

      <div className="space-y-4">
        {!loading && filteredMoods.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 p-10 text-center">
            <p className="text-slate-500 dark:text-slate-400">No entries matched those filters.</p>
          </div>
        )}

        {filteredMoods.map((entry) => (
          <MoodCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
