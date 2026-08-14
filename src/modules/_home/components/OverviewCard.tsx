import { useUserSummary } from '@/shared/hooks';
import { useAuth } from '@/shared/supabase/authProvider';
import { profilesService } from '@/shared/supabase/services/profiles';
import summaryStyles from '@/shared/styles/summary.module.css';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount } from '@/shared/utils';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import styles from '../homeCard.module.css';

export const OverviewCard = () => {
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
      <VCard className={styles.loadingCard}>
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
      color: 'var(--color-success)',
    },
    {
      label: 'Расходы',
      value: formatAmount(summary.expense + summary.daily),
      percent: percentOfIncome(summary.expense + summary.daily),
      color: 'var(--color-error)',
    },
    {
      label: 'Накопления',
      value: formatAmount(summary.savings),
      percent: percentOfIncome(summary.savings),
      color: 'var(--color-warning)',
    },
    {
      label: 'Баланс',
      value: formatAmount(balance),
      percent: percentOfIncome(balance),
      color: balance >= 0 ? 'var(--color-success)' : 'var(--color-error)',
    },
  ];

  return (
    <Link to="/overview" className={styles.link}>
      <VCard interactive className={styles.card}>
        <div className={summaryStyles.title}>Обзор</div>
        <div className={summaryStyles.subtitle}>Последний отчёт</div>
        <div className={summaryStyles.grid}>
          {items.flatMap((item) => [
            <div key={`${item.label}-label`} className={summaryStyles.label}>
              {item.label}
            </div>,
            item.percent != null ? (
              <div key={`${item.label}-percent`} className={summaryStyles.percent}>
                {item.percent}% от доходов
              </div>
            ) : (
              <span key={`${item.label}-percent`} />
            ),
            <div
              key={`${item.label}-value`}
              className={summaryStyles.value}
              style={{ color: item.color }}
            >
              {item.value}
            </div>,
          ])}
        </div>
      </VCard>
    </Link>
  );
};