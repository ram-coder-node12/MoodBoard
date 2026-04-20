import React, { useState, useMemo, useCallback } from 'react';
import { useMoodState } from '../context/MoodContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatCard = React.memo(({ title, value, subtitleClass, valueClass }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex flex-col justify-between">
     <p className="text-sm font-medium text-slate-500">{title}</p>
     <p className={`mt-2 text-3xl font-bold truncate ${valueClass || 'text-slate-900'}`}>{value}</p>
  </div>
));

export default function Trends() {
  const { moods, loading } = useMoodState();
  const [range, setRange] = useState(30);

  const handleRangeChange = useCallback((val) => {
      setRange(val);
  }, []);

  const filteredMoods = useMemo(() => {
    if (!moods || moods.length === 0) return [];
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - range);
    const thresholdStr = thresholdDate.toLocaleDateString('en-CA');
    return moods.filter(m => m.date >= thresholdStr).reverse();
  }, [moods, range]);

  const lineChartData = useMemo(() => {
    return filteredMoods.map(m => ({
      date: new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      level: m.level
    }));
  }, [filteredMoods]);

  const emotionFrequencies = useMemo(() => {
    const freqs = {};
    filteredMoods.forEach(m => {
      if (m.emotions) {
        m.emotions.forEach(e => {
            freqs[e] = (freqs[e] || 0) + 1;
        });
      }
    });
    
    return Object.keys(freqs).map(key => ({
      name: key,
      count: freqs[key]
    })).sort((a,b) => b.count - a.count).slice(0, 5);
  }, [filteredMoods]);

  const { avgScore, bestDay, worstDay } = useMemo(() => {
    if (filteredMoods.length === 0) return { avgScore: 0, bestDay: null, worstDay: null };
    
    let sum = 0;
    let bD = filteredMoods[0];
    let wD = filteredMoods[0];

    filteredMoods.forEach(m => {
        sum += m.level;
        if (m.level > bD.level) bD = m;
        if (m.level <= wD.level) wD = m;
    });
    
    return {
        avgScore: (sum / filteredMoods.length).toFixed(1),
        bestDay: bD,
        worstDay: wD
    };
  }, [filteredMoods]);

  if (loading) {
     return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
           <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
           <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
              <div className="h-32 bg-slate-200 rounded-xl"></div>
              <div className="h-32 bg-slate-200 rounded-xl"></div>
              <div className="h-32 bg-slate-200 rounded-xl"></div>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-80 bg-slate-200 rounded-xl"></div>
              <div className="h-80 bg-slate-200 rounded-xl"></div>
           </div>
        </div>
     );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Your Emotional Trends</h1>
        <div className="inline-flex rounded-lg shadow-sm" role="group">
          {[7, 30, 90].map(val => (
            <button
              key={val}
              type="button"
              onClick={() => handleRangeChange(val)}
              className={`px-4 py-2 text-sm font-medium border ${
                range === val 
                ? 'bg-violet-600 text-white border-violet-600 z-10' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              } ${val === 7 ? 'rounded-l-lg' : val === 90 ? 'rounded-r-lg' : ''}`}
            >
              {val} Days
            </button>
          ))}
        </div>
      </div>

      {filteredMoods.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-dashed border-slate-300">
          <p className="text-slate-500 text-lg">Not enough data to show trends for this period.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <StatCard title="Average Score" value={avgScore} valueClass="text-violet-600" />
            <StatCard title="Best Day" value={new Date(bestDay.date).toLocaleDateString(undefined, {weekday: 'long'})} valueClass="text-green-500" />
            <StatCard title="Most Challenging" value={new Date(worstDay.date).toLocaleDateString(undefined, {weekday: 'long'})} valueClass="text-red-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <h2 className="text-lg font-medium text-slate-900 mb-6">Mood Trajectory</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis domain={[1, 5]} hide={true} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}}/>
                    <Line type="monotone" dataKey="level" stroke="#7c3aed" strokeWidth={3} dot={{r:4, fill:'#7c3aed', strokeWidth:0}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <h2 className="text-lg font-medium text-slate-900 mb-6">Top Emotions</h2>
              {emotionFrequencies.length > 0 ? (
                 <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={emotionFrequencies} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13}} />
                            <Tooltip cursor={{fill: 'transparent'}}/>
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                                {emotionFrequencies.map((entry, idx) => (
                                    <Cell key={`cell-${idx}`} fill="#a78bfa" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
              ) : (
                  <div className="h-full flex items-center justify-center">
                      <p className="text-slate-400">No emotional tags logged.</p>
                  </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
