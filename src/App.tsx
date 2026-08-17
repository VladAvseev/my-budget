import { registration } from '@/modules/_registration';
import { AuthProvider } from '@/shared/supabase/authProvider';
import React from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import { login } from './modules/_login';
import { profile } from './modules/_profile';
import { reports } from './modules/_reports';
import { accumulations } from './modules/_accumulations';
import { overview } from './modules/_overview';
import { home } from './modules/_home';
import { help } from './modules/_help';
import { admin } from './modules/_admin';
import { notFound } from './modules/_notFound';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {login()}
          {registration()}
          {home()}
          {profile()}
          {reports()}
          {accumulations()}
          {overview()}
          {help()}
          {admin()}
          {notFound()}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
