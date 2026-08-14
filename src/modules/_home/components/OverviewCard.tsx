import { useUserSummary } from '@/shared/hooks';
import { useAuth } from '@/shared/supabase/authProvider';
import { profilesService } from '@/shared/supabase/services/profiles';
import { useThemeStyles } from '@/shared/theme';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount } from '@/shared/utils';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

export const OverviewCard = () => {
  const styles = useThemeStyles();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const { data: summary, isFetched: summaryFetched } = useUserSummary(userId);
  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await profilesService.getOrCreateProfile(userId, {
        email: user?.email,
      });
      if (error) throw error;
      return data ?? null;
    },
  });

  if (!profileQuery.isFetched || !summaryFetched) {
    return (
      <VCard
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: styles.spacing.xl,
          flex: '1 1 300px',
          minWidth: 300,
        }}
      >
        <VLoader size={28} />
      </VCard>
    );
  }

  const startBalance = Number(profileQuery.data?.start_balance ?? 0) || 0;
  const income = summary.income + startBalance;
  const balance = income - summary.expense - summary.daily - summary.savings;
  const percentOfIncome = (value: number) =>
    income > 0 ? Math.max(0, Math.round((value / income) * 100)) : null;

  const items = [
    {
      label: 'Доходы',
      value: formatAmount(income),
      percent: null,
      color: styles.colors.success,
    },
    {
      label: 'Расходы',
      value: formatAmount(summary.expense + summary.daily),
      percent: percentOfIncome(summary.expense + summary.daily),
      color: styles.colors.error,
    },
    {
      label: 'Накопления',
      value: formatAmount(summary.savings),
      percent: percentOfIncome(summary.savings),
      color: styles.colors.warning,
    },
    {
      label: 'Баланс',
      value: formatAmount(balance),
      percent: percentOfIncome(balance),
      color: balance >= 0 ? styles.colors.success : styles.colors.error,
    },
  ];

  return (
    <Link
      to="/overview"
      style={{ textDecoration: 'none', display: 'block', flex: '1 1 300px', minWidth: 300 }}
    >
      <VCard
        interactive
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: styles.spacing.m,
          height: '100%',
        }}
      >
        <div
          style={{
            fontSize: styles.typography.fontSize.l,
            fontWeight: styles.typography.fontWeight.bold,
            color: styles.colors.textPrimary,
          }}
        >
          Обзор
        </div>
        <div
          style={{
            fontSize: styles.typography.fontSize.s,
            color: styles.colors.textSecondary,
          }}
        >
          Последний отчёт
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto auto',
            columnGap: styles.spacing.m,
            rowGap: styles.spacing.s,
          }}
        >
          {items.flatMap((item) => [
            <div
              key={`${item.label}-label`}
              style={{
                fontSize: styles.typography.fontSize.s,
                color: styles.colors.textSecondary,
              }}
            >
              {item.label}
            </div>,
            item.percent != null ? (
              <div
                key={`${item.label}-percent`}
                style={{
                  fontSize: styles.typography.fontSize.s,
                  color: styles.colors.textSecondary,
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.percent}% от доходов
              </div>
            ) : (
              <span key={`${item.label}-percent`} />
            ),
            <div
              key={`${item.label}-value`}
              style={{
                fontSize: styles.typography.fontSize.m,
                fontWeight: styles.typography.fontWeight.bold,
                color: item.color,
                textAlign: 'right',
              }}
            >
              {item.value}
            </div>,
          ])}
        </div>
      </VCard>
    </Link>
  );
};
