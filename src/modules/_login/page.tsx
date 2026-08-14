import { Provider } from 'jotai';
import { VCard } from '@/shared/ui/VCard';
import commonStyles from '@/shared/styles/common.module.css';
import { LoginForm } from './components/LoginForm';

export const Page: React.FC = () => {
  return (
    <Provider>
      <div className={commonStyles.centeredContent}>
        <div className={commonStyles.centeredCard}>
          <VCard>
            <h1 className={commonStyles.cardTitle}>Авторизация</h1>
            <LoginForm />
          </VCard>
        </div>
      </div>
    </Provider>
  );
};