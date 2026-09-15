import { AuthLayout } from '@/shared/layout/AuthLayout';
import { Provider } from 'jotai';
import { LoginForm } from './components/LoginForm';

export const Page: React.FC = () => {
  return (
    <Provider>
      <AuthLayout title="Авторизация">
        <LoginForm />
      </AuthLayout>
    </Provider>
  );
};
