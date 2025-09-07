// src/routes/AppRoutes.tsx
import React, { useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import PrivateRoute from './PrivateRoute';
import AuthRoutes from './AuthRoutes';
import useAuthStore from '@/stores/authStore';
import { Dashboard } from '@/views';

const AppRoutes: React.FC = () => {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  const routes = useMemo(
    () => (
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/auth/*"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthLayout>
                <AuthRoutes />
              </AuthLayout>
            )
          }
        />

        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<div>Profile Page - Coming Soon</div>} />
        </Route>

        {/* Catch-All Route */}
        <Route
          path="*"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
      </Routes>
    ),
    [isLoggedIn]
  );

  return <Router>{routes}</Router>;
};

export default AppRoutes;