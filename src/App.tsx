import { registration } from '@/modules/_registration';
import { legal } from '@/modules/_legal';
import { AuthProvider } from '@/shared/api/authProvider';
import { ConsentGate } from '@/shared/api/components/ConsentGate';
import React from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import { login } from '@/modules/_login';
import { profile } from '@/modules/_profile';
import { reports } from '@/modules/_reports';
import { accumulations } from '@/modules/_accumulations';
import { overview } from '@/modules/_overview';
import { home } from '@/modules/_home';
import { admin } from '@/modules/_admin';
import { notFound } from '@/modules/_notFound';
import { AsyncPage } from '@/shared/ui/AsyncPage';

const LandingPage = AsyncPage(() => import('@/modules/_landing/page'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* ConsentGate — поверх всех маршрутов: '/' для авторизованных идёт
            через AuthSwitch, минуя ProtectedRoute, поэтому gate не в гарде. */}
        <ConsentGate>
          <Routes>
            {login()}
            {registration()}
            {home({ guest: <LandingPage /> })}
            {profile()}
            {reports()}
            {accumulations()}
            {overview()}
            {admin()}
            {legal()}
            {notFound()}
          </Routes>
        </ConsentGate>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
