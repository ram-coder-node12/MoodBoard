import React, { useState } from 'react';

export default function FutureLetterModal({ onSave, onSkip }) {
  const [content, setContent] = useState('');

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-700 transform transition-all p-8 text-center relative pointer-events-auto">
        <span className="text-6xl block mb-4">🌟</span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">A Message for Tomorrow</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 px-4">
          You're having a good day. Would you like to leave a short note of encouragement for a future "you" when things might not be so easy?
        </p>

        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="To my future self: remember this feeling..."
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 mb-6 text-slate-900 dark:text-white transition-colors"
        />

        <div className="flex justify-center gap-3">
          <button 
            onClick={onSkip}
            className="px-6 py-2.5 font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Not right now
          </button>
          <button 
             onClick={() => onSave(content)}
             disabled={content.trim().length === 0}
             className="px-6 py-2.5 font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors"
          >
            Seal the Letter
          </button>
        </div>
      </div>
    </div>
  );
}
