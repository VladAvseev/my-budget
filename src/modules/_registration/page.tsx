import { AuthLayout } from '@/shared/layout/AuthLayout';
import { Provider } from 'jotai';
import { RegistrationForm } from './components/RegistrationForm';

export const Page: React.FC = () => {
  return (
    <Provider>
      <AuthLayout title="Регистрация">
        <RegistrationForm />
      </AuthLayout>
    </Provider>
  );
};
