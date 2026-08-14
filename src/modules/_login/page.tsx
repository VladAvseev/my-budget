import { Provider } from 'jotai';
import { useThemeStyles } from '@/shared/theme';
import { VCard } from '@/shared/ui/VCard';
import { LoginForm } from './components/LoginForm';

export const Page: React.FC = () => {
  const styles = useThemeStyles();

  return (
    <Provider>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: styles.spacing.l,
          backgroundColor: styles.colors.bgPrimary,
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <VCard>
            <h1
              style={{
                margin: 0,
                marginBottom: styles.spacing.l,
                fontSize: styles.typography.fontSize.l,
                fontWeight: styles.typography.fontWeight.bold,
                color: styles.colors.textPrimary,
              }}
            >
              Авторизация
            </h1>
            <LoginForm />
          </VCard>
        </div>
      </div>
    </Provider>
  );
};