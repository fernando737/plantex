// src/routes/AuthRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Login } from '@/views';

const AuthRoutes: React.FC = () => (
  <Routes>
    <Route path="login" element={<Login />} />
    <Route path="*" element={<Login />} />
  </Routes>
);

export default AuthRoutes;