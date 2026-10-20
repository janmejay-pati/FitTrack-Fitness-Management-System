import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Routes & Shell
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import Layout from './components/Layout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Authenticated User Pages
import DashboardPage from './pages/DashboardPage';
import WorkoutsPage from './pages/WorkoutsPage';
import MealsPage from './pages/MealsPage';
import BmiPage from './pages/BmiPage';
import WaterPage from './pages/WaterPage';
import GoalsPage from './pages/GoalsPage';
import AchievementsPage from './pages/AchievementsPage';
import DietPlansPage from './pages/DietPlansPage';
import WorkoutPlansPage from './pages/WorkoutPlansPage';
import TutorialsPage from './pages/TutorialsPage';
import ProfilePage from './pages/ProfilePage';

// Administrative Portal
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#131b2e',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '0.9rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff'
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff'
              }
            }
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Athlete Portal */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/workouts" element={<WorkoutsPage />} />
              <Route path="/meals" element={<MealsPage />} />
              <Route path="/bmi" element={<BmiPage />} />
              <Route path="/water" element={<WaterPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/diet-plans" element={<DietPlansPage />} />
              <Route path="/workout-plans" element={<WorkoutPlansPage />} />
              <Route path="/tutorials" element={<TutorialsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Protected Admin Console */}
          <Route element={<AdminRoute />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
