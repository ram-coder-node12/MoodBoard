import React from 'react';

export default function LowMoodSupportModal({ letter, copingMechanism, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl border border-slate-100 dark:border-slate-700 p-8 space-y-6">
        <div>
          <span className="text-5xl block mb-3">🫶</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Low Mood Support</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            You do not have to fix everything right now. Start with one gentle next step.
          </p>
        </div>

        {letter && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-2">A note from a better day</p>
            <p className="text-slate-800 dark:text-slate-100 italic leading-relaxed">"{letter.content}"</p>
          </div>
        )}

        {copingMechanism && (
          <div className="rounded-2xl border border-violet-200 dark:border-violet-900/40 bg-violet-50 dark:bg-violet-900/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300 mb-2">Try this first</p>
            <p className="text-lg font-semibold text-violet-700 dark:text-violet-300">{copingMechanism}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-700/50 p-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">1-minute grounding</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Take 5 slow breaths, longer on the exhale.</li>
              <li>Name 3 things you can see around you.</li>
              <li>Unclench your jaw and drop your shoulders.</li>
              <li>Drink some water or step into fresh air.</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-700/50 p-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Need human support now?</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li><a href="https://988lifeline.org/get-help/" target="_blank" rel="noreferrer" className="text-violet-600 dark:text-violet-300 font-medium hover:underline">Call or text 988</a> for the Suicide & Crisis Lifeline.</li>
              <li><a href="https://www.crisistextline.org/" target="_blank" rel="noreferrer" className="text-violet-600 dark:text-violet-300 font-medium hover:underline">Text HOME to 741741</a> to reach Crisis Text Line in the U.S.</li>
              <li>If you may act on thoughts of self-harm, call emergency services now.</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
          >
            I have a next step
          </button>
        </div>
      </div>
    </div>
  );
}
