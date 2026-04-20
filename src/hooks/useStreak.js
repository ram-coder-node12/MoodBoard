import { useMemo } from 'react';

/**
 * Helper to compute days difference
 */
function getDaysDiff(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = Math.abs(d2 - d1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
function getTodayStr() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export default function useStreak(moods) {
  const { currentStreak, longestStreak } = useMemo(() => {
    if (!moods || moods.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // moods is expected to be sorted desc by date from the DB.
    // Ensure sorting just in case.
    const sortedMoods = [...moods].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    
    const today = getTodayStr();

    // Check if streak is active (must have logged today or yesterday)
    let isStreakActive = true;
    let expectedDate = today;

    // Check if we logged today
    if (sortedMoods.length > 0) {
      const firstEntry = sortedMoods[0].date;
      if (firstEntry !== today) {
        // If not today, check if yesterday. Otherwise current streak is 0.
        const prevDate = new Date();
        prevDate.setDate(prevDate.getDate() - 1);
        const yesterdayStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
        
        if (firstEntry !== yesterdayStr) {
          isStreakActive = false;
        } else {
          expectedDate = yesterdayStr;
        }
      }
    }

    // Calculate current streak
    if (isStreakActive) {
      for (let i = 0; i < sortedMoods.length; i++) {
        const entryDate = sortedMoods[i].date;
        if (entryDate === expectedDate) {
          current++;
          
          // setup next expected date (1 day before)
          const nextD = new Date(expectedDate);
          nextD.setDate(nextD.getDate() - 1);
          expectedDate = `${nextD.getFullYear()}-${String(nextD.getMonth() + 1).padStart(2, '0')}-${String(nextD.getDate()).padStart(2, '0')}`;
        } else if (entryDate > expectedDate) {
           // Skip if duplicate dates exist for some reason
           continue; 
        } else {
          break; // Broken streak
        }
      }
    }

    // Calculate longest streak historically
    let historicalTempStreak = 0;
    let lastSeenDate = null;
    
    for (let i = sortedMoods.length - 1; i >= 0; i--) {
      const entryDate = sortedMoods[i].date;
      
      if (!lastSeenDate) {
        historicalTempStreak = 1;
        longest = 1;
      } else {
        const diff = getDaysDiff(lastSeenDate, entryDate);
        if (diff === 1) {
          historicalTempStreak++;
          if (historicalTempStreak > longest) longest = historicalTempStreak;
        } else if (diff === 0) {
          // duplicate ignore
        } else {
          historicalTempStreak = 1;
        }
      }
      lastSeenDate = entryDate;
    }

    // In boundary cases current could theoretically exceed historical (if processing differs), ensure consistency.
    longest = Math.max(longest, current);

    return { currentStreak: current, longestStreak: longest };
  }, [moods]);

  return { currentStreak, longestStreak };
}
