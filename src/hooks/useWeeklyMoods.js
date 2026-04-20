import { useMemo } from 'react';

/**
 * Returns an array of YYYY-MM-DD strings for the trailing 'days' count ending on 'endDate'
 */
function getLastNDaysDates(n, endDateStr) {
  const dates = [];
  const end = endDateStr ? new Date(endDateStr) : new Date();
  
  for (let i = 0; i < n; i++) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${yr}-${mo}-${day}`);
  }
  return dates.reverse(); // oldest to newest
}

export default function useWeeklyMoods(moods) {
  return useMemo(() => {
    // Array of 7 strings YYYY-MM-DD up to today
    const last7Days = getLastNDaysDates(7);
    
    // Map dates to mood objects or null
    return last7Days.map(dateStr => {
      const existingEntry = moods.find(m => m.date === dateStr);
      return {
        date: dateStr,
        ...existingEntry // will drop in level, emotions etc if exists
      };
    });
  }, [moods]);
}
