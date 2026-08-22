import {
  signedOperationAmount,
  type Accumulation,
  type Goal,
  type OperationType,
} from '@/shared/supabase/types/domain';

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
    return sum + signedOperationAmount(operation.type as OperationType, Number(operation.amount) || 0);
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

    return {
      goal,
      savedAmount,
      percent: Math.min(100, Math.max(0, Math.round(rawPercent))),
      reached: target > 0 && savedAmount >= target,
    };
  });
