import React from 'react';
import { useNavigate } from 'react-router-dom';

const MOOD_EMOJIS = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄'
};

const BORDER_COLORS = {
  1: 'border-l-red-400',
  2: 'border-l-orange-400',
  3: 'border-l-yellow-400',
  4: 'border-l-lime-400',
  5: 'border-l-green-500'
};

const MOOD_LABELS = {
  1: 'Terrible',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Great'
};

function MoodCard({ entry }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/log?date=${entry.date}`);
  };

  const formattedDate = new Date(entry.date).toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const borderClass = BORDER_COLORS[entry.level] || 'border-l-slate-300';
  const snippet = entry.note && entry.note.length > 100 
    ? entry.note.substring(0, 100) + '...' 
    : entry.note;

  return (
    <div 
      onClick={handleClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 ${borderClass}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
           <div className="text-sm font-medium text-slate-500">{formattedDate}</div>
           {/* Scaffolding: public badge */}
           {entry.isPublic && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-700 uppercase tracking-wide">Public</span>}
        </div>
        <div className="text-xl flex items-center" title={MOOD_LABELS[entry.level]}>
          <span className="text-sm text-slate-700 mr-2 font-medium hidden sm:inline">
            {MOOD_LABELS[entry.level]}
          </span>
          {MOOD_EMOJIS[entry.level]} 
        </div>
      </div>
      
      {entry.emotions && entry.emotions.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {entry.emotions.map(emotion => (
            <span key={emotion} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              {emotion}
            </span>
          ))}
        </div>
      )}
      
      {snippet && (
        <p className="text-slate-600 text-sm italic font-serif leading-relaxed">
          "{snippet}"
        </p>
      )}
    </div>
  );
}

// React.memo isolated
export default React.memo(MoodCard);
