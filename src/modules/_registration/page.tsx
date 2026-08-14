import { Provider } from 'jotai';
import { VCard } from '@/shared/ui/VCard';
import commonStyles from '@/shared/styles/common.module.css';
import { RegistrationForm } from './components/RegistrationForm';

export const Page: React.FC = () => {
  return (
    <Provider>
      <div className={commonStyles.centeredContent}>
        <div className={commonStyles.centeredCard}>
          <VCard>
            <h1 className={commonStyles.cardTitle}>Регистрация</h1>
            <RegistrationForm />
          </VCard>
        </div>
      </div>
    </Provider>
  );
};