import React from 'react';
import { useNavigate } from 'react-router-dom';

const MOOD_EMOJIS = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄'
};

const MOOD_LABELS = {
  1: 'Terrible',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Great'
};

function MoodDetailModal({ entry, onClose }) {
  const navigate = useNavigate();

  if (!entry) return null;

  const formattedDate = new Date(entry.date).toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0 animate-fadeIn">
        
        <div 
          className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white rounded-md text-slate-400 hover:text-slate-500 focus:outline-none transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-bold text-slate-900" id="modal-title">
                {formattedDate}
              </h3>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-5xl">{MOOD_EMOJIS[entry.level]}</span>
                  <span className="text-2xl font-bold text-slate-800">{MOOD_LABELS[entry.level]}</span>
                </div>
              </div>

              {entry.emotions && entry.emotions.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {entry.emotions.map(emotion => (
                    <span key={emotion} className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium border border-violet-200">
                      {emotion}
                    </span>
                  ))}
                </div>
              )}

              {entry.note ? (
                <div className="mt-6 bg-slate-50 rounded-xl p-5 text-slate-700 whitespace-pre-wrap text-sm leading-relaxed border border-slate-100 font-serif">
                  {entry.note}
                </div>
              ) : (
                <p className="mt-6 text-sm text-slate-500 italic">No notes for this day.</p>
              )}
            </div>
          </div>
          
          <div className="mt-8 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => navigate(`/log?date=${entry.date}`)}
              className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-violet-600 text-base font-medium text-white hover:bg-violet-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              Edit Entry
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-slate-700 hover:text-slate-800 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(MoodDetailModal);
