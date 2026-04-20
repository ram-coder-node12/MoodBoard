import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMoodState } from '../context/MoodContext';
import { getAllInsights, saveInsight, getInsightByWeek } from '../services/insightService';
import { getAIInsight } from '../services/aiService';
import { getMoodsForRange } from '../services/moodService';
import toast from 'react-hot-toast';

const parseBoldText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="text-violet-800 font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const InsightCard = React.memo(({ insight }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-violet-500 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
            Week of {new Date(insight.weekStart).toLocaleDateString()}
          </span>
      </div>
      <div className="prose prose-violet text-slate-700 leading-relaxed font-serif text-base">
          {parseBoldText(insight.content)}
      </div>
    </div>
  );
});

export default function Insights() {
  const { currentUser } = useAuth();
  const [insights, setInsights] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const newestRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (currentUser) {
        try {
          const history = await getAllInsights(currentUser.uid);
          setInsights(history);
        } catch (error) {
          toast.error(error.message || "Failed to load insights");
        }
      }
      setLoadingInitial(false);
    };
    fetchHistory();
  }, [currentUser]);
  
  const currentWeekStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay()); // Sunday
    return d.toLocaleDateString('en-CA');
  })();

  const hasInsightThisWeek = insights.some(i => i.weekStart === currentWeekStart);

  const handleGetInsight = useCallback(async () => {
    try {
      setLoadingInsight(true);

      let existing = await getInsightByWeek(currentUser.uid, currentWeekStart);
      if (existing) {
        setInsights(prev => [existing, ...prev.filter(i => i.id !== existing.id)]);
        toast.error("You already generated an insight this week.");
        return;
      }

      // Fetch last 7 days natively to send into gemini wrapper
      const endDate = new Date().toLocaleDateString('en-CA');
      const startD = new Date();
      startD.setDate(startD.getDate() - 6);
      const startDate = startD.toLocaleDateString('en-CA');

      const recentMoods = await getMoodsForRange(currentUser.uid, startDate, endDate);
      
      const content = await getAIInsight(recentMoods);
      const newId = await saveInsight(currentUser.uid, currentWeekStart, content);
      
      const newEntry = {
          id: newId,
          userId: currentUser.uid,
          weekStart: currentWeekStart,
          content: content,
          createdAt: new Date()
      };

      setInsights(prev => [newEntry, ...prev]);
      toast.success("Your weekly insight is ready!");
      
      setTimeout(() => {
         newestRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error) {
       console.error(error);
       toast.error(error.message || "Failed to generate insight.");
    } finally {
      setLoadingInsight(false);
    }
  }, [currentUser, currentWeekStart]);

  if (loadingInitial) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
         <div className="h-8 bg-slate-200 rounded w-1/3 mb-8"></div>
         <div className="space-y-6">
            <div className="h-40 bg-slate-200 rounded-xl"></div>
            <div className="h-40 bg-slate-200 rounded-xl"></div>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
         <div>
            <h1 className="text-3xl font-bold text-slate-900">AI Weekly Insights</h1>
            <p className="mt-2 text-sm text-slate-500">Discover deeper patterns in your emotional journey</p>
         </div>
         
         <button
            onClick={handleGetInsight}
            disabled={loadingInsight || hasInsightThisWeek}
            className="flex-shrink-0 flex justify-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none disabled:bg-slate-400 transition-colors"
         >
            {loadingInsight ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Analysing your week...
                </span>
            ) : hasInsightThisWeek ? 'Check Back Next Week' : 'Get This Week\'s Insight'}
         </button>
       </div>

       <div className="space-y-6">
         {insights.length === 0 && !loadingInsight ? (
            <div className="text-center py-16 bg-white rounded border border-dashed border-slate-300">
                <span className="text-4xl block mb-4">🧠</span>
                <p className="text-slate-500">You don't have any insights yet.</p>
                <p className="text-sm text-slate-400 mt-2 text-balance max-w-sm mx-auto">Generate your first insight to receive AI-powered feedback on your emotional patterns.</p>
            </div>
         ) : (
            insights.map((insight, index) => (
                <div key={insight.id} ref={index === 0 ? newestRef : null}>
                   <InsightCard insight={insight} />
                </div>
            ))
         )}
       </div>
    </div>
  );
}
