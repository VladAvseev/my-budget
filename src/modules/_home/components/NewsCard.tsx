import { ClearIcon } from '@/shared/icons';
import { useThemeStyles } from '@/shared/theme';
import { VCard } from '@/shared/ui/VCard';
import { VIconButton } from '@/shared/ui/VIconButton';
import { useHideNews } from '../api/useHideNews';
import { useShowNews } from '../api/useShowNews';

export const NewsCard = () => {
  const styles = useThemeStyles();
  const { showNews, isLoading, error } = useShowNews();
  const hideNews = useHideNews();

  if (isLoading || error || !showNews) {
    return null;
  }

  return (
    <VCard
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: styles.spacing.s,
        flex: '1 1 100%',
        minWidth: 300,
        paddingRight: styles.spacing.xxl,
      }}
    >
      <div
        style={{
          fontSize: styles.typography.fontSize.l,
          fontWeight: styles.typography.fontWeight.bold,
          color: styles.colors.textPrimary,
        }}
      >
        Что нового?
      </div>
      <div
        style={{
          fontSize: styles.typography.fontSize.m,
          color: styles.colors.textSecondary,
          lineHeight: styles.typography.lineHeight.normal,
        }}
      >
        В настройках отчётов добавлена возможность устанавливать лимиты для категорий
        расходов.
      </div>
      <div
        style={{
          position: 'absolute',
          top: styles.spacing.m,
          right: styles.spacing.m,
        }}
      >
        <VIconButton
          ariaLabel="Закрыть"
          onClick={() => hideNews.mutate()}
          isLoading={hideNews.isPending}
          color={styles.colors.textSecondary}
        >
          <ClearIcon size={16} color={styles.colors.textSecondary} />
        </VIconButton>
      </div>
    </VCard>
  );
};
