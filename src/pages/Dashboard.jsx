import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMoodState } from '../context/MoodContext';
import { useUserProfile } from '../context/UserContext';
import useStreak from '../hooks/useStreak';
import useWeeklyMoods from '../hooks/useWeeklyMoods';
import MoodCard from '../components/MoodCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getWeeklySummary } from '../utils/moodInsights';
import { formatTimeLabel } from '../utils/date';
import { getReminderDescription, getSuggestedReminderTime } from '../utils/reminders';

const StatCard = React.memo(({ title, value, subtitle }) => (
  <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-xl border border-slate-100 dark:border-slate-700 p-6 flex flex-col justify-between transition-colors">
    <div>
      <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h2>
      <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</div>
    </div>
    {subtitle && (
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
         <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{subtitle}</div>
      </div>
    )}
  </div>
));

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { profile } = useUserProfile();
  const { moods, getMoodForDate, loading } = useMoodState();
  const navigate = useNavigate();

  const { currentStreak, longestStreak } = useStreak(moods);
  const weeklyMoods = useWeeklyMoods(moods);

  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA'), []);
  const todaysEntry = useMemo(() => getMoodForDate(todayStr), [getMoodForDate, todayStr]);

  const averageWeeklyScore = useMemo(() => {
    const valid = weeklyMoods.filter(m => m.level !== undefined);
    if (valid.length === 0) return 0;
    const sum = valid.reduce((acc, m) => acc + m.level, 0);
    return (sum / valid.length).toFixed(1);
  }, [weeklyMoods]);

  const weeklySummary = useMemo(() => getWeeklySummary(moods), [moods]);
  const suggestedReminderTime = useMemo(() => getSuggestedReminderTime(moods), [moods]);
  const reminderCopy = useMemo(() => getReminderDescription(profile, moods), [profile, moods]);

  const chartData = useMemo(() => {
    return weeklyMoods.map(m => {
      const dayName = new Date(m.date).toLocaleDateString(undefined, { weekday: 'short' });
      return {
        name: dayName,
        level: m.level || 0,
        originalDate: m.date
      };
    });
  }, [weeklyMoods]);

  const getColorForLevel = useCallback((level) => {
    const colors = {
      1: '#ef4444', // red-400
      2: '#fb923c', // orange-400
      3: '#facc15', // yellow-400
      4: '#a3e635', // lime-400
      5: '#22c55e'  // green-500
    };
    return colors[level] || '#e2e8f0'; 
  }, []);

  const handleEditToday = useCallback(() => {
    navigate(`/log?date=${todayStr}`);
  }, [navigate, todayStr]);

  const handleLogToday = useCallback(() => {
    navigate('/log');
  }, [navigate]);

  const handleViewCalendar = useCallback(() => {
    navigate('/calendar');
  }, [navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="h-40 bg-slate-200 rounded-xl"></div>
          <div className="h-40 bg-slate-200 rounded-xl"></div>
          <div className="h-40 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
           <div className="h-72 bg-slate-200 rounded-xl"></div>
           <div className="h-72 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-slate-900 dark:text-white transition-colors">
      
      <div>
        <h1 className="text-3xl font-bold">
          Hello, {currentUser?.displayName?.split(' ')[0] || 'Friend'} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Welcome to your emotional space.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        
        <div className="bg-white shadow-sm rounded-xl border border-slate-100 p-6 flex flex-col justify-center">
          <h2 className="text-sm font-medium text-slate-500 mb-4">Today</h2>
          {todaysEntry ? (
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-4xl">
                  {{1:'😞', 2:'😕', 3:'😐', 4:'🙂', 5:'😄'}[todaysEntry.level]}
                </span>
                <span className="text-xl font-bold text-slate-800">Logged!</span>
              </div>
              <button onClick={handleEditToday} className="text-sm font-medium text-violet-600 hover:text-violet-500">
                Edit Entry →
              </button>
            </div>
          ) : (
            <div>
              <p className="text-slate-500 text-sm mb-4">You haven't logged your mood yet.</p>
              <button 
                onClick={handleLogToday}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-violet-600 hover:bg-violet-700 w-full justify-center transition-colors"
              >
                Log Mood Now
              </button>
            </div>
          )}
        </div>

        <StatCard 
            title="Current Streak" 
            value={<div className="flex items-end text-violet-600">{currentStreak}<span className="text-lg text-slate-500 ml-2 mb-1">days</span></div>} 
            subtitle={<>Longest streak: <span className="font-semibold text-slate-700">{longestStreak}</span> days</>}
        />

        <StatCard 
            title="Total Entries" 
            value={moods.length} 
            subtitle={<>Week Avg: <span className="text-lg font-bold text-slate-900">{averageWeeklyScore}</span> <span className="text-xs">/ 5.0</span></>}
        />

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Weekly Summary</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A quick read on how this week has felt so far.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-semibold">
              {weeklySummary.average ? `${weeklySummary.average}/5 avg` : 'No data yet'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Entries</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{weeklySummary.entries}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Top Emotion</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white capitalize">{weeklySummary.topEmotion || 'None yet'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Best Day</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{weeklySummary.bestEntry?.date || 'Not enough data'}</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {weeklySummary.summary}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Smart Reminders</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Stay consistent with reminders tailored to your routine.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
              Best time: {formatTimeLabel(suggestedReminderTime)}
            </span>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {reminderCopy}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/profile#reminders')}
              className="px-4 py-2.5 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
            >
              Configure reminders
            </button>
            <button
              type="button"
              onClick={() => navigate('/journal')}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Review recent patterns
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Recent Logs</h2>
            <button onClick={handleViewCalendar} className="text-sm font-medium text-violet-600 hover:text-violet-500">View Calendar →</button>
          </div>
          
          <div className="space-y-4">
            {moods.length > 0 ? (
              moods.slice(0, 3).map(entry => (
                <MoodCard key={entry.id} entry={entry} />
              ))
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <span className="text-slate-500 text-sm">No entries yet. Start tracking your journey!</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Last 7 Days Loop</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis domain={[0, 5]} hide={true} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: '1px solid #f1f5f9'}}/>
                <Bar dataKey="level" radius={[4, 4, 4, 4]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorForLevel(entry.level)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
