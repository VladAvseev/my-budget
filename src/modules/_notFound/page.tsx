import { useThemeStyles } from '@/shared/theme';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { useNavigate } from 'react-router-dom';

export const Page: React.FC = () => {
  const styles = useThemeStyles();
  const navigate = useNavigate();

  return (
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
        <VCard style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: styles.typography.fontSize.xxl,
              fontWeight: styles.typography.fontWeight.bold,
              color: styles.colors.accent,
              marginBottom: styles.spacing.s,
            }}
          >
            404
          </div>
          <div
            style={{
              fontSize: styles.typography.fontSize.l,
              fontWeight: styles.typography.fontWeight.medium,
              color: styles.colors.textPrimary,
              marginBottom: styles.spacing.l,
            }}
          >
            Страница не найдена
          </div>
          <VButton onClick={() => navigate('/')}>Перейти на главную</VButton>
        </VCard>
      </div>
    </div>
  );
};