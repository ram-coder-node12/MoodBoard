import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useUserProfile } from '../context/UserContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { profile } = useUserProfile();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Log Mood', path: '/log' },
    { name: 'Journal', path: '/journal' },
    { name: 'Calendar', path: '/calendar' },
    { name: 'Trends', path: '/trends' },
    { name: 'Insights', path: '/insights' },
  ];

  return (
    <nav className="bg-white dark:bg-slate-800 shadow transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">MoodBoard</span>
            </div>
            {currentUser && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      isActive
                        ? 'border-violet-500 text-slate-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors'
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
          {currentUser && (
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              {/* Streak Indicator */}
              {profile && profile.streak > 0 && (
                <div className="flex items-center text-orange-500 font-bold px-3 py-1 bg-orange-50 dark:bg-orange-500/10 rounded-full" title="Current Streak">
                  🔥 {profile.streak}
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              <NavLink to="/profile" className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <img 
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.email}`} 
                  alt="Avatar" 
                  className="h-8 w-8 rounded-full bg-violet-100 dark:bg-slate-700"
                />
              </NavLink>
              
              <button
                onClick={handleLogout}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
          
          {/* Mobile menu button */}
          {currentUser && (
            <div className="-mr-2 flex items-center sm:hidden space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 dark:text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {currentUser && isOpen && (
        <div className="sm:hidden bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 transition-colors">
          <div className="pt-2 pb-3 space-y-1">
             {profile && profile.streak > 0 && (
                <div className="flex items-center justify-center text-orange-500 font-bold py-2 bg-orange-50 dark:bg-orange-500/10 mx-4 rounded-lg mb-2">
                  🔥 {profile.streak} Day Streak!
                </div>
              )}
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? 'bg-violet-50 dark:bg-violet-900/30 border-violet-500 text-violet-700 dark:text-violet-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors'
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <img 
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.email}`} 
                  alt="Avatar" 
                  className="h-10 w-10 rounded-full bg-violet-100 dark:bg-slate-700"
                />
              </div>
              <div className="ml-3">
                 <div className="text-base font-medium text-slate-800 dark:text-slate-200">{currentUser.displayName || 'User'}</div>
                 <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{currentUser.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <NavLink
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-base font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Profile
              </NavLink>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
