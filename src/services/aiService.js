export async function getAIInsight(moodEntries) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Local dynamically generated fallback based on trends
  const generateFallback = () => {
    if (!moodEntries || moodEntries.length === 0) {
       return `**Emotional Pattern This Week**
Not enough data was logged this week to identify strong patterns.

**Key Triggers Identified**
- No specific triggers identified yet.
- Logging more consistently will help reveal what impacts your mood.

**Personalized Suggestions**
- Try setting a daily reminder to log your mood.
- Even brief notes can help build a better picture over time.

**Encouragement**
Every entry counts. Keep going!`;
    }

    const avg = (moodEntries.reduce((a, b) => a + b.level, 0) / moodEntries.length).toFixed(1);
    let bestDay = moodEntries[0];
    let worstDay = moodEntries[0];
    const freqs = {};

    moodEntries.forEach(m => {
       if (m.level > bestDay.level) bestDay = m;
       if (m.level < worstDay.level) worstDay = m;
       (m.emotions || []).forEach(e => freqs[e] = (freqs[e] || 0) + 1);
    });

    const topEmotions = Object.entries(freqs).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]).join(' and ') || 'mixed emotions';

    return `**Emotional Pattern This Week**
Your average mood this week was a **${avg}/5**. You predominantly felt **${topEmotions}**.

**Key Triggers Identified**
- Your highest moment was on ${new Date(bestDay.date).toLocaleDateString('en-US', {weekday:'long'})} (Level ${bestDay.level}).
- Your most challenging day was ${new Date(worstDay.date).toLocaleDateString('en-US', {weekday:'long'})} (Level ${worstDay.level}).

**Personalized Suggestions**
- Look back at what happened on ${new Date(bestDay.date).toLocaleDateString('en-US', {weekday:'long'})} and try to replicate those conditions.
- On tougher days, give yourself permission to step back and rest without guilt.

**Encouragement**
You showed up and logged your feelings ${moodEntries.length} times this week. That self-awareness is incredible!`;
  };

  if (!apiKey) {
    return generateFallback();
  }

  const summary = moodEntries.map(e =>
    `Date: ${e.date}, Level: ${e.level}/5, Emotions: ${e.emotions.join(', ')}, Note: ${e.note}`
  ).join('\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: "You are a compassionate emotional wellness coach. Analyse this student's mood journal entries from the past week and provide structured insight with exactly these 4 sections: **Emotional Pattern This Week** (1 paragraph summary), **Key Triggers Identified** (2-3 bullet points), **Personalized Suggestions** (2 actionable bullet points), **Encouragement** (1 short motivating sentence). Be warm, honest, and supportive. Never be alarming." }]
          },
          contents: [{
            parts: [{ text: `Here are my mood journal entries from this week:\n\n${summary}` }]
          }],
          generationConfig: { maxOutputTokens: 800 }
        })
      }
    );

    if (!response.ok) {
        console.warn('Gemini API failed or quota exceeded. Falling back to local generation.');
        return generateFallback();
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? generateFallback();
    
  } catch (error) {
    console.error('AI Insight Error: ', error);
    return generateFallback(); // Silently fallback on network/quota failure
  }
}
