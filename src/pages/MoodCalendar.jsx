import React, { useState, useMemo, useCallback } from 'react';
import { useMoodState } from '../context/MoodContext';
import MoodDetailModal from '../components/MoodDetailModal';

export default function MoodCalendar() {
  const { moods, loading, getMoodForDate } = useMoodState();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  }, [currentYear, currentMonth]);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  }, [currentYear, currentMonth]);

  const getColorForLevel = useCallback((level) => {
    const classes = {
      1: 'bg-red-400',
      2: 'bg-orange-400',
      3: 'bg-yellow-400',
      4: 'bg-lime-400',
      5: 'bg-green-500'
    };
    return classes[level] || 'bg-slate-200';
  }, []);

  const calendarDays = useMemo(() => {
    const days = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    const startPadding = firstDay.getDay(); 
    const daysInMonth = lastDay.getDate();

    for (let i = 0; i < startPadding; i++) {
       days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(currentYear, currentMonth, i);
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        days.push({ date: dStr, day: i });
    }

    const remainingObj = days.length % 7;
    if (remainingObj !== 0) {
        for(let i=0; i< (7 - remainingObj); i++) {
            days.push(null);
        }
    }
    
    return days;
  }, [currentYear, currentMonth]);

  const closeEntryModal = useCallback(() => {
      setSelectedEntry(null);
  }, []);

  const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

  if (loading) {
     return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
           <div className="h-40 bg-slate-200 rounded-xl w-full"></div>
        </div>
     );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <div className="bg-white rounded-xl shadow border border-slate-100 p-6">
        
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            ←
          </button>
          <h2 className="text-2xl font-bold text-slate-900">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button 
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {calendarDays.map((cell, idx) => {
             if (!cell) {
                 return <div key={`pad-${idx}`} className="h-16 rounded-lg opacity-0 pointer-events-none bg-slate-50 border border-slate-100"></div>;
             }

             const activeEntry = getMoodForDate(cell.date);
             const hasEntry = !!activeEntry;
             const isToday = new Date().toLocaleDateString('en-CA') === cell.date;

             const handleClick = () => {
                 if (hasEntry) setSelectedEntry(activeEntry);
             };

             return (
               <button
                 key={cell.date}
                 onClick={handleClick}
                 disabled={!hasEntry}
                 className={`relative h-16 sm:h-20 flex flex-col items-center justify-center rounded-lg border transition-all ${
                   hasEntry ? 'cursor-pointer hover:shadow-md border-transparent bg-slate-50' : 'cursor-default border-dashed border-slate-200 opacity-60'
                 } ${isToday ? 'ring-2 ring-violet-500' : ''}`}
               >
                 <span className={`text-sm ${hasEntry ? 'font-medium text-slate-900' : 'text-slate-400'}`}>
                   {cell.day}
                 </span>
                 <div className={`mt-2 h-3 w-3 rounded-full ${hasEntry ? getColorForLevel(activeEntry.level) : 'bg-transparent'}`}></div>
               </button>
             );
          })}
        </div>
      </div>

      {selectedEntry && (
        <MoodDetailModal entry={selectedEntry} onClose={closeEntryModal} />
      )}
    </div>
  );
}
