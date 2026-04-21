import React from 'react';

export default function CopingJarModal({ copingMechanism, onClose }) {
  if (!copingMechanism) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-700 transform transition-all p-8 text-center relative pointer-events-auto">
        <span className="text-6xl block mb-6">🫙</span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Take a moment for yourself</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 px-4">
          It looks like you're having a tough day. We reached into your digital Coping Jar and pulled out this recommendation:
        </p>

        <div className="py-6 px-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl mb-8">
           <span className="text-xl font-medium text-violet-600 dark:text-violet-400">
             {copingMechanism}
           </span>
        </div>

        <button 
           onClick={onClose}
           className="px-8 py-3 font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm transition-colors w-full sm:w-auto"
        >
          Try it out
        </button>
      </div>
    </div>
  );
}
