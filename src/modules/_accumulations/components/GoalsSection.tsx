import { PlusIcon } from '@/shared/icons';
import { useAccumulations, useGoals } from '@/shared/hooks';
import { useAuth } from '@/shared/supabase/authProvider';
import {
  signedOperationAmount,
  type Goal,
  type OperationType,
} from '@/shared/supabase/types/domain';
import {
  buildGoalForecast,
  buildGoalsOverallProgress,
  buildGoalsProgress,
  formatAmount,
  formatDisplay,
  toISODate,
  type GoalForecast,
} from '@/shared/utils';
import { VBadge } from '@/shared/ui/VBadge';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VCategoryDot } from '@/shared/ui/VCategoryDot';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VLoader } from '@/shared/ui/VLoader';
import commonStyles from '@/shared/styles/common.module.css';
import { useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { goalModalAtom } from '../atoms/accumulations';
import { useAverageMonthlyGrowth } from '../hooks/useAverageMonthlyGrowth';
import { useReports } from '../api/useReports';
import { useCategories } from '../api/useCategories';
import { useSavingsOperations } from '../api/useSavingsOperations';
import { useDisplayCurrency } from '../hooks/useDisplayCurrency';
import styles from './GoalsSection.module.css';

const pluralYears = (years: number): string => {
  const mod10 = years % 10;
  const mod100 = years % 100;
  if (mod10 === 1 && mod100 !== 11) return `${years} год`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${years} года`;
  return `${years} лет`;
};

const formatMonthsDuration = (totalMonths: number): string => {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(pluralYears(years));
  if (months > 0) parts.push(`${months} мес.`);
  return parts.join(' ');
};

const GoalForecastInfo = ({
  forecast,
  symbol,
  convertOptions,
}: {
  forecast: GoalForecast;
  symbol: string | undefined;
  convertOptions: { from: string; to: string; rates: Record<string, number> } | undefined;
}) => {
  if (forecast.requiredMonthly === null) {
    return null;
  }

  return (
    <div className={styles.forecast}>
      <div className={styles.forecastRow}>
        Рекомендуется пополнять на {' '}
        {formatAmount(Math.ceil(forecast.requiredMonthly), symbol, convertOptions)} в месяц
      </div>
    </div>
  );
};

export const GoalsSection = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const goalsQuery = useGoals(userId);
  const accumulationsQuery = useAccumulations(userId);
  const savingsQuery = useSavingsOperations(userId);
  const categoriesQuery = useCategories(userId);
  const reportsQuery = useReports();
  const setGoalModal = useSetAtom(goalModalAtom);
  const { displaySymbol, convertOptions } = useDisplayCurrency();
  const avgMonthlyGrowth = useAverageMonthlyGrowth(userId);

  const goals = useMemo(() => goalsQuery.data ?? [], [goalsQuery.data]);
  const categories = categoriesQuery.data ?? [];

  const progressList = useMemo(
    () =>
      buildGoalsProgress(
        goals,
        accumulationsQuery.data ?? [],
        savingsQuery.data ?? [],
      ).sort((a, b) => Math.abs(b.savedAmount) - Math.abs(a.savedAmount)),
    [goals, accumulationsQuery.data, savingsQuery.data],
  );
  const overallProgress = buildGoalsOverallProgress(progressList);

  const overallRemaining = Math.max(0, overallProgress.totalTarget - overallProgress.totalSaved);
  const overallForecastMonths =
    overallRemaining > 0 && avgMonthlyGrowth !== null && avgMonthlyGrowth > 0
      ? Math.ceil(overallRemaining / avgMonthlyGrowth)
      : null;
  const overallForecastDate =
    overallForecastMonths !== null
      ? (() => {
          const now = new Date();
          return toISODate(new Date(now.getFullYear(), now.getMonth() + overallForecastMonths, 1));
        })()
      : null;

  // План пополнения: цели с будущей датой — по своей дате, без даты/просроченные —
  // по прогнозному сроку общей суммы; достигнутые цели не требуют пополнений.
  // Каждое слагаемое округляется вверх, чтобы план совпадал с суммой
  // целых рекомендаций из карточек целей.
  const monthlyPlan = useMemo(() => {
    if (overallForecastMonths === null) {
      return progressList.reduce(
        (sum, p) => sum + Math.ceil(buildGoalForecast(p.goal, p.savedAmount).requiredMonthly ?? 0),
        0,
      );
    }
    let total = 0;
    for (const p of progressList) {
      if (p.reached) continue;
      const required = buildGoalForecast(p.goal, p.savedAmount).requiredMonthly;
      if (required !== null) {
        total += Math.ceil(required);
        continue;
      }
      const remaining = Math.max(0, (Number(p.goal.amount) || 0) - p.savedAmount);
      total += Math.ceil(remaining / overallForecastMonths);
    }
    return total;
  }, [progressList, overallForecastMonths]);

  // Текущий период: отчёт, внутри которого находится сегодня.
  const todayISO = toISODate(new Date());
  const currentReport = (reportsQuery.data ?? []).find(
    (report) => report.period_start <= todayISO && todayISO <= report.period_end,
  );

  // Прогресс пополнений за текущий период: нетто по категориям целей.
  const goalCategoryIds = useMemo(
    () => new Set(goals.map((goal) => goal.category_id)),
    [goals],
  );
  const currentPeriodSaved = useMemo(() => {
    if (!currentReport) return 0;
    return (savingsQuery.data ?? []).reduce((sum, operation) => {
      if (operation.report_id !== currentReport.id) return sum;
      if (operation.category_id === null || !goalCategoryIds.has(operation.category_id)) return sum;
      return (
        sum +
        signedOperationAmount(operation.type as OperationType, Number(operation.amount) || 0)
      );
    }, 0);
  }, [currentReport, savingsQuery.data, goalCategoryIds]);

  const showPeriodProgress = monthlyPlan > 0;
  const periodPlanPercent =
    monthlyPlan > 0
      ? Math.min(100, Math.max(0, Math.round((currentPeriodSaved / monthlyPlan) * 100)))
      : 0;

  const isLoading =
    goalsQuery.isLoading ||
    accumulationsQuery.isLoading ||
    savingsQuery.isLoading ||
    categoriesQuery.isLoading;
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={commonStyles.titleXl}>Цели</div>
        <VIconButton
          ariaLabel="Установить цель"
          onClick={() => setGoalModal({ goal: null })}
          isDisabled={isLoading}
          color="var(--color-accent)"
        >
          <PlusIcon size={24} color="currentColor" />
        </VIconButton>
      </div>

      {goalsQuery.error && <VBanner type="error" visible message="Не удалось загрузить цели" />}

      {isLoading && (
        <div className={styles.loaderWrap}>
          <VLoader size={28} />
        </div>
      )}

      {!isLoading && !goalsQuery.error && goals.length === 0 && (
        <VCard>
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>
              Цель — это желаемая сумма накоплений для выбранной категории.
            </div>
            <div className={styles.emptyHint}>
              Нажмите «+», чтобы задать желаемую сумму накоплений по категории.
            </div>
          </div>
        </VCard>
      )}

      {!isLoading && progressList.length > 0 && (
        <>
          <div className={commonStyles.animateCard}>
            <VCard className={styles.overall}>
              <div className={styles.overallTitle}>Общий прогресс</div>
              <div
                className={styles.track}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={overallProgress.percent}
              >
                <div
                  className={styles.fill}
                  style={{ width: `${overallProgress.percent}%` }}
                />
              </div>
              <div className={styles.cardBottom}>
                <span className={styles.savedAmount}>
                  {formatAmount(overallProgress.totalSaved, displaySymbol, convertOptions)}
                </span>
                <span className={styles.targetAmount}>
                  из {formatAmount(overallProgress.totalTarget, displaySymbol, convertOptions)}
                </span>
                <span className={styles.percent}>{overallProgress.percent}%</span>
              </div>
              {showPeriodProgress && (
                <div className={styles.periodRow}>
                  Пополнено в текущем периоде:{' '}
                  {formatAmount(currentPeriodSaved, displaySymbol, convertOptions)} из{' '}
                  {formatAmount(monthlyPlan, displaySymbol, convertOptions)} (
                  {periodPlanPercent}%)
                </div>
              )}
              {overallForecastMonths !== null && overallForecastDate && (
                <div className={styles.overallForecast}>
                  Достижима к {formatDisplay(overallForecastDate)} (за{' '}
                  {formatMonthsDuration(overallForecastMonths)})
                </div>
              )}
            </VCard>
          </div>

          <div className={styles.list}>
          {progressList.map((progress, index) => {
            const goal: Goal = progress.goal;
            const category = categoryById.get(goal.category_id) ?? null;
            const pending = Boolean((goal as { _optimistic?: boolean })._optimistic);
            const targetAmount = Number(goal.amount) || 0;
            const forecast = buildGoalForecast(goal, progress.savedAmount);

            return (
              <VCard
                key={goal.id}
                role="button"
                tabIndex={pending ? -1 : 0}
                aria-disabled={pending}
                aria-label={`Цель: ${category?.name ?? 'Без категории'}`}
                onClick={() => {
                  if (!pending) {
                    setGoalModal({ goal });
                  }
                }}
                onKeyDown={(event) => {
                  if (!pending && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    setGoalModal({ goal });
                  }
                }}
                className={`${commonStyles.animateCard} ${styles.card}`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className={styles.cardTop}>
                  {category?.color ? (
                    <VCategoryDot color={category.color} />
                  ) : (
                    <span className={styles.dot} />
                  )}
                  <span className={styles.cardTitle}>{category?.name ?? 'Без категории'}</span>
                  {goal.target_date && (
                    <span className={styles.targetDate}>{formatDisplay(goal.target_date)}</span>
                  )}
                  {progress.overdue && <VBadge variant="warning">Просрочена</VBadge>}
                  {progress.reached && <VBadge variant="success">Цель достигнута</VBadge>}
                </div>

                <div
                  className={styles.track}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress.percent}
                >
                  <div className={styles.fill} style={{ width: `${progress.percent}%` }} />
                </div>

                <div className={styles.cardBottom}>
                  <span className={styles.savedAmount}>
                    {formatAmount(progress.savedAmount, displaySymbol, convertOptions)}
                  </span>
                  <span className={styles.targetAmount}>
                    из {formatAmount(targetAmount, displaySymbol, convertOptions)}
                  </span>
                  <span className={styles.percent}>{progress.percent}%</span>
                </div>

                {!progress.reached && !pending && (
                  <GoalForecastInfo
                    forecast={forecast}
                    symbol={displaySymbol}
                    convertOptions={convertOptions}
                  />
                )}
              </VCard>
            );
          })}
          </div>
        </>
      )}
    </div>
  );
};
