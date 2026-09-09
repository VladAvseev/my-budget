import { toISODate } from './date';
import {
  signedOperationAmount,
  type Accumulation,
  type Goal,
  type OperationType,
} from '@/shared/api/types/domain';

export interface GoalProgressSource {
  category_id: string | null;
  type: string;
  amount: string | number;
}

export interface GoalProgress {
  goal: Goal;
  savedAmount: number;
  percent: number;
  reached: boolean;
  overdue: boolean;
}

export const getCategorySavedTotal = (
  categoryId: string,
  accumulations: Array<Pick<Accumulation, 'category_id' | 'amount'>>,
  savingsOperations: GoalProgressSource[],
): number =>
  accumulations.reduce(
    (sum, accumulation) =>
      sum + (accumulation.category_id === categoryId ? Number(accumulation.amount) || 0 : 0),
    0,
  ) +
  savingsOperations.reduce((sum, operation) => {
    if (operation.category_id !== categoryId) {
      return sum;
    }
    return (
      sum + signedOperationAmount(operation.type as OperationType, Number(operation.amount) || 0)
    );
  }, 0);

export const buildGoalsProgress = (
  goals: Goal[],
  accumulations: Array<Pick<Accumulation, 'category_id' | 'amount'>>,
  savingsOperations: GoalProgressSource[],
): GoalProgress[] =>
  goals.map((goal) => {
    const savedAmount = getCategorySavedTotal(goal.category_id, accumulations, savingsOperations);
    const target = Number(goal.amount) || 0;
    const rawPercent = target > 0 ? (savedAmount / target) * 100 : 0;
    const reached = target > 0 && savedAmount >= target;

    return {
      goal,
      savedAmount,
      percent: Math.min(100, Math.max(0, Math.round(rawPercent))),
      reached,
      // Просрочена: дата есть, она в прошлом и цель не достигнута.
      // Сравнение ISO-строк YYYY-MM-DD; дата «сегодня» ещё не просрочка.
      overdue: goal.target_date !== null && goal.target_date < toISODate(new Date()) && !reached,
    };
  });

export interface GoalsOverallProgress {
  totalSaved: number;
  totalTarget: number;
  percent: number;
}

export const buildGoalsOverallProgress = (progress: GoalProgress[]): GoalsOverallProgress => {
  // Перевыполнение отдельной цели не увеличивает общий прогресс:
  // вклад цели ограничен её суммой (минимум 0 при отрицательных накоплениях).
  const totalSaved = progress.reduce(
    (sum, item) => sum + Math.max(0, Math.min(item.savedAmount, Number(item.goal.amount) || 0)),
    0,
  );
  const totalTarget = progress.reduce((sum, item) => sum + (Number(item.goal.amount) || 0), 0);
  const rawPercent = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return {
    totalSaved,
    totalTarget,
    percent: Math.min(100, Math.max(0, Math.round(rawPercent))),
  };
};

export interface GoalForecast {
  targetDate: string | null;
  monthsLeft: number | null;
  requiredMonthly: number | null;
}

const monthDiff = (from: Date, to: Date): number =>
  (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());

const countMonthsUntil = (targetDate: Date, now: Date): number => {
  // Месяцы с текущего по месяц перед датой цели включительно:
  // 01.08.2026 -> август исключён (к 1-му числу сумма уже нужна),
  // 02.08.2026 -> август включён (в августе ещё есть дни для откладывания).
  const fullMonths = monthDiff(now, targetDate);
  return targetDate.getDate() > 1 ? fullMonths + 1 : fullMonths;
};

export const buildGoalForecast = (goal: Goal, savedAmount: number): GoalForecast => {
  const target = Number(goal.amount) || 0;
  const remaining = Math.max(0, target - savedAmount);

  const empty: GoalForecast = {
    targetDate: null,
    monthsLeft: null,
    requiredMonthly: null,
  };

  if (target <= 0 || remaining <= 0) {
    return empty;
  }

  const targetDate = goal.target_date ? new Date(`${goal.target_date}T00:00:00`) : null;

  const isDateValid = targetDate !== null && !Number.isNaN(targetDate.getTime());
  const isDateInFuture = isDateValid && targetDate > new Date();

  const monthsLeft = isDateInFuture ? Math.max(1, countMonthsUntil(targetDate, new Date())) : null;
  const requiredMonthly = monthsLeft !== null ? remaining / monthsLeft : null;

  return {
    targetDate: isDateValid ? goal.target_date : null,
    monthsLeft,
    requiredMonthly,
  };
};
