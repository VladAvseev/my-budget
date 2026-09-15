import type { Account, Goal, Operation } from '@/shared/api/types/domain';
import { toISODate } from '@/shared/utils/date';

export interface GoalProgress {
  goal: Goal;
  savedAmount: number;
  percent: number;
  reached: boolean;
  overdue: boolean;
}
const percent = (saved: number, target: number) =>
  Math.min(100, Math.max(0, Math.round((saved / target) * 100)));

export const buildGoalsProgress = (
  goals: Goal[],
  accounts: Account[],
  now = new Date(),
): GoalProgress[] => {
  const active = new Map(
    accounts.filter((account) => !account.is_closed).map((account) => [account.id, account]),
  );
  return goals.flatMap((goal) => {
    const account = active.get(goal.account_id);
    if (!account) return [];
    const reached = account.balance >= goal.amount;
    return [
      {
        goal,
        savedAmount: account.balance,
        percent: percent(account.balance, goal.amount),
        reached,
        overdue: goal.target_date !== null && goal.target_date < toISODate(now) && !reached,
      },
    ];
  });
};

export const buildGoalsOverallProgress = (progress: GoalProgress[]) => {
  const totalSaved = progress.reduce(
    (sum, item) => sum + Math.max(0, Math.min(item.savedAmount, item.goal.amount)),
    0,
  );
  const totalTarget = progress.reduce((sum, item) => sum + item.goal.amount, 0);
  return {
    totalSaved,
    totalTarget,
    percent: totalTarget > 0 ? percent(totalSaved, totalTarget) : 0,
  };
};

export interface GoalForecast {
  targetDate: string | null;
  monthsLeft: number | null;
  requiredMonthly: number | null;
}

export const buildGoalForecast = (
  goal: Goal,
  savedAmount: number,
  now = new Date(),
): GoalForecast => {
  const remaining = Math.max(0, goal.amount - savedAmount);
  const targetDate = goal.target_date ? new Date(`${goal.target_date}T00:00:00`) : null;
  let monthsLeft: number | null = null;
  if (remaining > 0 && targetDate && targetDate > now) {
    // К первому числу сумма уже нужна: месяц желаемой даты не включается.
    monthsLeft = Math.max(
      1,
      (targetDate.getFullYear() - now.getFullYear()) * 12 +
        targetDate.getMonth() -
        now.getMonth() +
        (targetDate.getDate() > 1 ? 1 : 0),
    );
  }
  return {
    targetDate: goal.target_date,
    monthsLeft,
    requiredMonthly: monthsLeft === null ? null : remaining / monthsLeft,
  };
};

/** Прогноз по общему темпу капитала; желаемая дата влияет только на рекомендацию. */
export const forecastAchievement = (remaining: number, avg: number | null, now = new Date()) => {
  if (remaining <= 0 || avg === null || avg <= 0) return null;
  const months = Math.ceil(remaining / avg);
  const date = new Date(now.getFullYear(), now.getMonth() + months, 1);
  if (!Number.isFinite(months) || Number.isNaN(date.getTime()) || date.getFullYear() > 9999)
    return null;
  return { months, date: toISODate(date) };
};

export const goalMonthlyContribution = (
  progress: GoalProgress,
  overallMonths: number | null,
): number => {
  if (progress.reached) return 0;
  const required = buildGoalForecast(progress.goal, progress.savedAmount).requiredMonthly;
  if (required !== null) return Math.ceil(required);
  return overallMonths === null
    ? 0
    : Math.ceil(Math.max(0, progress.goal.amount - progress.savedAmount) / overallMonths);
};

/** Нетто операций текущего отчёта; внутренние переводы между целями взаимно гасятся. */
export const currentGoalContributions = (
  operations: Operation[],
  accountIds: ReadonlySet<string>,
): number =>
  operations.reduce((sum, op) => {
    if (op.type === 'transfer') {
      return (
        sum +
        (op.to_account_id && accountIds.has(op.to_account_id) ? op.amount : 0) -
        (op.from_account_id && accountIds.has(op.from_account_id) ? op.amount : 0)
      );
    }
    if (!op.account_id || !accountIds.has(op.account_id)) return sum;
    return sum + (op.type === 'income' ? op.amount : -op.amount);
  }, 0);
