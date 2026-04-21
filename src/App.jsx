import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { MoodProvider } from './context/MoodContext';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PageSpinner from './components/PageSpinner';
import SmartReminderManager from './components/SmartReminderManager';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const LogMood = React.lazy(() => import('./pages/LogMood'));
const MoodCalendar = React.lazy(() => import('./pages/MoodCalendar'));
const Trends = React.lazy(() => import('./pages/Trends'));
const Insights = React.lazy(() => import('./pages/Insights'));
const Journal = React.lazy(() => import('./pages/Journal'));
const Profile = React.lazy(() => import('./pages/Profile'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Scaffolded for future
const Friends = React.lazy(() => import('./pages/Friends'));
const Community = () => null;

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 flex flex-col transition-colors duration-200">
              <Navbar />
              <main className="flex-1">
            <Suspense fallback={<PageSpinner />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected routes wrapped in MoodProvider so public routes don't needlessly fetch dataset */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <MoodProvider>
                      <SmartReminderManager />
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/log" element={<LogMood />} />
                        <Route path="/calendar" element={<MoodCalendar />} />
                        <Route path="/trends" element={<Trends />} />
                        <Route path="/insights" element={<Insights />} />
                        <Route path="/journal" element={<Journal />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/friends" element={<Friends />} />
                        <Route path="/community" element={<Community />} />
                      </Routes>
                    </MoodProvider>
                  </ProtectedRoute>
                } />

                {/* Catch all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
            </div>
            <Toaster position="top-right" />
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
