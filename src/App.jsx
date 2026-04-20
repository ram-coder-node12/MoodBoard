import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { MoodProvider } from './context/MoodContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PageSpinner from './components/PageSpinner';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const LogMood = React.lazy(() => import('./pages/LogMood'));
const MoodCalendar = React.lazy(() => import('./pages/MoodCalendar'));
const Trends = React.lazy(() => import('./pages/Trends'));
const Insights = React.lazy(() => import('./pages/Insights'));
const Profile = React.lazy(() => import('./pages/Profile'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Scaffolded for future
const Friends = React.lazy(() => import('./pages/Friends'));
const Community = () => null;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
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
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/log" element={<LogMood />} />
                        <Route path="/calendar" element={<MoodCalendar />} />
                        <Route path="/trends" element={<Trends />} />
                        <Route path="/insights" element={<Insights />} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
