import { formatDateKey, getEndOfWeek, getStartOfWeek } from './date';

export function getWeeklySummary(moods, referenceDate = new Date()) {
  const start = formatDateKey(getStartOfWeek(referenceDate));
  const end = formatDateKey(getEndOfWeek(referenceDate));
  const weeklyMoods = moods.filter((mood) => mood.date >= start && mood.date <= end);

  if (weeklyMoods.length === 0) {
    return {
      weeklyMoods,
      average: null,
      entries: 0,
      bestEntry: null,
      toughestEntry: null,
      topEmotion: null,
      summary: 'You have not logged any moods this week yet. A few quick check-ins will unlock your weekly summary.'
    };
  }

  const average = weeklyMoods.reduce((sum, mood) => sum + mood.level, 0) / weeklyMoods.length;
  const sortedByMood = [...weeklyMoods].sort((a, b) => b.level - a.level);
  const emotionCounts = weeklyMoods.flatMap((mood) => mood.emotions || []).reduce((acc, emotion) => {
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {});

  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const bestEntry = sortedByMood[0];
  const toughestEntry = sortedByMood[sortedByMood.length - 1];

  let summary = `You logged ${weeklyMoods.length} time${weeklyMoods.length === 1 ? '' : 's'} this week with an average mood of ${average.toFixed(1)}/5.`;
  if (topEmotion) {
    summary += ` "${topEmotion}" showed up most often.`;
  }
  if (bestEntry && toughestEntry && bestEntry.id !== toughestEntry.id) {
    summary += ` Your highest day was ${bestEntry.date} and your toughest day was ${toughestEntry.date}.`;
  }

  return {
    weeklyMoods,
    average: average.toFixed(1),
    entries: weeklyMoods.length,
    bestEntry,
    toughestEntry,
    topEmotion,
    summary
  };
}
