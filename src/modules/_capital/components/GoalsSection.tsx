import { Amount } from '@/shared/ui/Amount';
import { PlusIcon } from '@/shared/icons';
import { useAccounts, useGoals } from '@/shared/api/hooks';
import { useAuth } from '@/shared/api/authProvider';
import { type Goal } from '@/shared/api/types/domain';
import { formatDisplay, toISODate } from '@/shared/utils';
import {
  buildGoalsOverallProgress,
  buildGoalsProgress,
  forecastAchievement,
  goalMonthlyContribution,
  currentGoalContributions,
} from '../utils/goals';
import { CreateGoalModal } from './CreateGoalModal';
import { EditGoalModal } from './EditGoalModal';
import { useGoalPeriodOperations } from '../api/useGoalPeriodOperations';
import { VBadge } from '@/shared/ui/VBadge';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VSkeletonList } from '@/shared/ui/VSkeleton';
import { useMemo, useState } from 'react';
import { useAverageMonthlyGrowth } from '../hooks/useAverageMonthlyGrowth';
import { useReports } from '../api/useReports';
import { useDisplayCurrency } from '../hooks/useDisplayCurrency';
import styles from './GoalsSection.module.css';

const EMPTY_ARRAY: never[] = [];

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

const AchievementInfo = ({
  remaining,
  growth,
}: {
  remaining: number;
  growth: ReturnType<typeof useAverageMonthlyGrowth>;
}) => {
  if (remaining <= 0) return null;
  if (growth.isLoading) return <div className={styles.forecast}>Расчёт прогноза…</div>;
  if (growth.error)
    return <div className={styles.forecast}>Не удалось загрузить данные прогноза</div>;
  const basis = growth.months > 0 && growth.months < 12 ? ' (по ' + growth.months + ' мес.)' : '';
  const forecast = forecastAchievement(remaining, growth.avg);
  const text =
    growth.avg === null
      ? 'Недостаточно истории для прогноза'
      : growth.avg <= 0
        ? 'недостижима при текущем темпе'
        : forecast
          ? 'Достижима к ' +
            formatDisplay(forecast.date) +
            ' (за ' +
            formatMonthsDuration(forecast.months) +
            ')'
          : 'Срок достижения слишком велик';
  return (
    <div className={styles.forecast}>
      {text}
      {basis}
    </div>
  );
};

export const GoalsSection = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const goalsQuery = useGoals(userId);
  const accountsQuery = useAccounts(userId);
  const reportsQuery = useReports(userId);
  const [goalModal, setGoalModal] = useState<{ goal: Goal | null } | null>(null);
  const { displaySymbol, convertOptions } = useDisplayCurrency();
  const growth = useAverageMonthlyGrowth(userId);

  const goals = useMemo(() => goalsQuery.data ?? [], [goalsQuery.data]);
  const accounts = useMemo(() => accountsQuery.data ?? EMPTY_ARRAY, [accountsQuery.data]);

  const progressList = useMemo(
    () =>
      buildGoalsProgress(goals, accounts).sort(
        (a, b) => Math.abs(b.savedAmount) - Math.abs(a.savedAmount),
      ),
    [goals, accounts],
  );
  const overallProgress = buildGoalsOverallProgress(progressList);

  const overallRemaining = Math.max(0, overallProgress.totalTarget - overallProgress.totalSaved);
  const overallForecastMonths = forecastAchievement(overallRemaining, growth.avg)?.months ?? null;
  const monthlyPlan = progressList.reduce(
    (sum, p) => sum + goalMonthlyContribution(p, overallForecastMonths),
    0,
  );
  const todayISO = toISODate(new Date());
  const currentReport = (reportsQuery.data ?? []).find(
    (report) => report.period_start <= todayISO && todayISO <= report.period_end,
  );
  const operationsQuery = useGoalPeriodOperations({ reportId: currentReport?.id ?? '' });
  const currentPeriodSaved = currentGoalContributions(
    operationsQuery.data ?? [],
    new Set(progressList.map((p) => p.goal.account_id)),
  );
  const periodReady =
    !reportsQuery.isLoading &&
    !reportsQuery.error &&
    (!currentReport || (!operationsQuery.isLoading && !operationsQuery.error));
  const showPeriodProgress = monthlyPlan > 0;
  const periodPlanPercent =
    monthlyPlan > 0
      ? Math.min(100, Math.max(0, Math.round((currentPeriodSaved / monthlyPlan) * 100)))
      : 0;

  const isLoading = goalsQuery.isLoading || accountsQuery.isLoading;
  const accountById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
  );
  const availableAccounts = accounts.filter(
    (account) => !account.is_closed && !goals.some((goal) => goal.account_id === account.id),
  );
  return (
    <section className={styles.root} aria-label="Цели">
      <div className={styles.header}>
        <h2 className={styles.heading}>Цели</h2>
        <VIconButton
          ariaLabel="Установить цель"
          onClick={() => setGoalModal({ goal: null })}
          isDisabled={
            isLoading ||
            !!accountsQuery.error ||
            !!goalsQuery.error ||
            availableAccounts.length === 0
          }
          color="var(--md-sys-color-primary)"
        >
          <PlusIcon size={24} color="currentColor" />
        </VIconButton>
      </div>

      {goalsQuery.error && goalsQuery.data == null && (
        <VErrorCard
          title="Не удалось загрузить цели"
          error={goalsQuery.error}
          onRetry={() => void goalsQuery.refetch()}
          isRetrying={goalsQuery.isFetching}
        />
      )}

      {goalsQuery.error && goalsQuery.data != null && (
        <VBanner type="error" visible message="Не удалось загрузить цели" />
      )}

      {isLoading && (
        <VSkeletonList count={2} cardProps={{ compact: true, title: false, lines: 2 }} />
      )}

      {!isLoading && !goalsQuery.error && !accountsQuery.error && progressList.length === 0 && (
        <VCard>
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>
              Цель — это желаемая сумма накоплений для выбранного счёта.
            </div>
            <div className={styles.emptyHint}>
              {availableAccounts.length
                ? 'Нажмите «+», чтобы задать желаемую сумму накоплений на счёте.'
                : 'Добавьте или откройте счёт в профиле, чтобы создать цель.'}
            </div>
          </div>
        </VCard>
      )}

      {accountsQuery.error && (
        <VErrorCard
          title="Не удалось загрузить счета"
          error={accountsQuery.error}
          onRetry={() => void accountsQuery.refetch()}
          isRetrying={accountsQuery.isFetching}
        />
      )}
      {!isLoading && !accountsQuery.error && progressList.length > 0 && (
        <>
          <div>
            <VCard className={styles.overall}>
              <div className={styles.overallTitle}>Общий прогресс</div>
              <div
                className={styles.track}
                aria-label="Общий прогресс целей"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={overallProgress.percent}
              >
                <div className={styles.fill} style={{ width: `${overallProgress.percent}%` }} />
              </div>
              <div className={styles.cardBottom}>
                <span className={styles.savedAmount}>
                  <Amount
                    value={overallProgress.totalSaved}
                    currencySymbol={displaySymbol}
                    convert={convertOptions}
                  />
                </span>
                <span className={styles.targetAmount}>
                  из{' '}
                  <Amount
                    value={overallProgress.totalTarget}
                    currencySymbol={displaySymbol}
                    convert={convertOptions}
                  />
                </span>
                <span className={styles.percent}>{overallProgress.percent}%</span>
              </div>
              {showPeriodProgress && periodReady && (
                <div className={styles.periodRow}>
                  Пополнено в текущем периоде:{' '}
                  <Amount
                    value={currentPeriodSaved}
                    currencySymbol={displaySymbol}
                    convert={convertOptions}
                  />{' '}
                  из{' '}
                  <Amount
                    value={monthlyPlan}
                    currencySymbol={displaySymbol}
                    convert={convertOptions}
                  />{' '}
                  ({periodPlanPercent}%)
                </div>
              )}
              {!periodReady && (
                <div className={styles.forecast}>
                  {reportsQuery.error || operationsQuery.error
                    ? 'Не удалось загрузить пополнения текущего периода'
                    : 'Загрузка пополнений…'}
                </div>
              )}
              <AchievementInfo remaining={overallRemaining} growth={growth} />
            </VCard>
          </div>

          <div className={styles.list}>
            {progressList.map((progress) => {
              const goal: Goal = progress.goal;
              const account = accountById.get(goal.account_id)!;
              const pending = Boolean((goal as { _optimistic?: boolean })._optimistic);
              const targetAmount = Number(goal.amount) || 0;
              const requiredMonthly = goalMonthlyContribution(progress, overallForecastMonths);

              return (
                <VCard
                  key={goal.id}
                  role="button"
                  tabIndex={pending ? -1 : 0}
                  aria-disabled={pending}
                  aria-label={`Цель: ${account.name}`}
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
                  className={styles.card}
                  aria-busy={pending}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.cardTitle}>{account.name}</span>
                    {goal.target_date && (
                      <span className={styles.targetDate}>{formatDisplay(goal.target_date)}</span>
                    )}
                    {progress.overdue && <VBadge variant="warning">Просрочена</VBadge>}
                    {progress.reached && <VBadge variant="success">Цель достигнута</VBadge>}
                  </div>

                  <div
                    className={styles.track}
                    aria-label={`Прогресс цели: ${account.name}`}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress.percent}
                  >
                    <div className={styles.fill} style={{ width: `${progress.percent}%` }} />
                  </div>

                  <div className={styles.cardBottom}>
                    <span className={styles.savedAmount}>
                      <Amount
                        value={progress.savedAmount}
                        currencySymbol={displaySymbol}
                        convert={convertOptions}
                      />
                    </span>
                    <span className={styles.targetAmount}>
                      из{' '}
                      <Amount
                        value={targetAmount}
                        currencySymbol={displaySymbol}
                        convert={convertOptions}
                      />
                    </span>
                    <span className={styles.percent}>{progress.percent}%</span>
                  </div>

                  {!progress.reached && !pending && (
                    <>
                      {requiredMonthly > 0 && (
                        <div className={styles.forecast}>
                          Рекомендуется пополнять на{' '}
                          <Amount
                            value={requiredMonthly}
                            currencySymbol={displaySymbol}
                            convert={convertOptions}
                          />{' '}
                          в месяц
                        </div>
                      )}
                      <AchievementInfo
                        remaining={goal.amount - progress.savedAmount}
                        growth={growth}
                      />
                    </>
                  )}
                </VCard>
              );
            })}
          </div>
        </>
      )}
      {goalModal &&
        (goalModal.goal ? (
          <EditGoalModal goal={goalModal.goal} onClose={() => setGoalModal(null)} />
        ) : (
          <CreateGoalModal onClose={() => setGoalModal(null)} />
        ))}
    </section>
  );
};
