import React from 'react';

export default function PastLetterModal({ letter, onClose }) {
  if (!letter) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-700 transform transition-all p-8 relative pointer-events-auto">
        <div className="absolute -top-12 -right-12 text-9xl opacity-10">🕊️</div>
        
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">A Letter From The Past...</h2>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-6 mb-8 relative">
           <span className="absolute -top-3 left-6 bg-white dark:bg-slate-800 px-2 text-xs font-semibold text-amber-600 dark:text-amber-500 rounded-full border border-amber-100 dark:border-amber-800">
              Written on a great day
           </span>
           <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-serif text-lg italic text-center">
             "{letter.content}"
           </p>
        </div>

        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Even on the darkest days, we have light within us. You've got this.
          </p>
          <button 
             onClick={onClose}
             className="px-8 py-3 font-medium text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            Thank you
          </button>
        </div>
      </div>
    </div>
  );
}
