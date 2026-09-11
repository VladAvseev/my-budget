import {
  accumulationsQueryKey,
  accumulationsTotalQueryKey,
  bootstrapQueryKey,
  goalsQueryKey,
  type UseBootstrapResponse,
} from '@/shared/api/hooks';
import type { Accumulation, Category, Goal } from '@/shared/api/types/domain';
import type { QueryClient } from '@tanstack/react-query';
import { categoriesQueryKey } from './useCategories';

/**
 * «Тихие» мутации страницы накоплений: серверный ответ раскладывается по
 * кэшам вместо onSettled-инвалидаций (list+total refetch, bootstrap-CTE).
 * Инвалидировать допустимо только точные ключи: ['accumulations', userId] —
 * префикс и для total-ключа, и для ['accumulations', 'growth-dynamics'].
 */

/** Имя/цвет категории для нового бакета — из кэша страницы (модалка живёт вместе с ним). */
function categoryMeta(qc: QueryClient, userId: string, id: string | null) {
  if (!id) return { name: null, color: null };
  const cached = qc.getQueryData<Category[]>(categoriesQueryKey(userId, 'savings'));
  const found = cached?.find((item) => item.id === id);
  return { name: found?.name ?? null, color: found?.color ?? null };
}

/**
 * Правка bootstrap-кэша главной под изменение накоплений: accumulationsTotal +
 * бакеты savings-структуры (сортировка amount DESC, как на сервере). Bootstrap
 * не загружен — нечего править, главная подтянет свежим. Бакет, сошедший к 0,
 * снимаем (сервер при удалении накопления группу тоже уберёт).
 */
function patchBootstrapForAccumulation(
  qc: QueryClient,
  userId: string,
  totalDelta: number,
  bucketDeltas: { categoryId: string | null; delta: number }[],
): void {
  qc.setQueryData<UseBootstrapResponse>(bootstrapQueryKey, (bootstrap) => {
    if (!bootstrap) return bootstrap;

    const amounts = new Map<string | null, number>();
    const meta = new Map<string | null, { name: string | null; color: string | null }>();
    for (const item of bootstrap.savingsStructure) {
      amounts.set(item.categoryId, item.amount);
      meta.set(item.categoryId, { name: item.name, color: item.color });
    }
    for (const { categoryId, delta } of bucketDeltas) {
      if (delta === 0) continue;
      amounts.set(categoryId, (amounts.get(categoryId) ?? 0) + delta);
      if (!meta.has(categoryId)) meta.set(categoryId, categoryMeta(qc, userId, categoryId));
    }

    const savingsStructure: UseBootstrapResponse['savingsStructure'] = [];
    for (const [categoryId, amount] of amounts) {
      if (amount === 0) continue;
      savingsStructure.push({
        categoryId,
        amount,
        ...(meta.get(categoryId) ?? { name: null, color: null }),
      });
    }
    savingsStructure.sort((a, b) => b.amount - a.amount);

    return {
      ...bootstrap,
      globalTotals: {
        ...bootstrap.globalTotals,
        accumulationsTotal: bootstrap.globalTotals.accumulationsTotal + totalDelta,
      },
      savingsStructure,
    };
  });
}

/**
 * Итог мутации накопления в кэшах:
 * - create:  previous=null, optimisticId — временный id, next — ответ сервера;
 * - update:  previous — строка до правки, next — ответ сервера;
 * - remove:  previous — удаляемая строка, next=null.
 * total пересчитывается из осевшего списка (сумма всех накоплений == весь список);
 * если списка в кэше не было — фолбэк на точечную инвалидацию, чтобы не затереть
 * серверную сумму неполным списком.
 */
export function settleAccumulationMutation(
  qc: QueryClient,
  userId: string,
  params: {
    previous: Accumulation | null;
    next: Accumulation | null;
    optimisticId?: string;
  },
): void {
  const { previous, next, optimisticId } = params;
  const key = accumulationsQueryKey(userId);
  const cached = qc.getQueryData<Accumulation[]>(key);

  if (cached === undefined) {
    qc.invalidateQueries({ queryKey: key, exact: true });
    qc.invalidateQueries({ queryKey: accumulationsTotalQueryKey(userId), exact: true });
  } else {
    const result = (cached ?? []).filter(
      (item) =>
        item.id !== optimisticId &&
        !(next === null && previous !== null && item.id === previous.id),
    );
    if (next) {
      const at = result.findIndex((item) => item.id === next.id);
      if (at === -1) {
        // вставка по created_at DESC (порядок ответа GET /accumulations)
        const insertAt = result.findIndex(
          (item) => new Date(item.created_at).getTime() < new Date(next.created_at).getTime(),
        );
        if (insertAt === -1) result.push(next);
        else result.splice(insertAt, 0, next);
      } else {
        result[at] = next;
      }
    }
    qc.setQueryData(key, result);
    // total пересобран из осевшего списка — вместо refetch /accumulations/total
    qc.setQueryData(accumulationsTotalQueryKey(userId), {
      total: result.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    });
  }

  const totalDelta = (Number(next?.amount) || 0) - (Number(previous?.amount) || 0);
  const bucketDeltas: { categoryId: string | null; delta: number }[] = [];
  if (previous) {
    bucketDeltas.push({
      categoryId: previous.category_id ?? null,
      delta: -(Number(previous.amount) || 0),
    });
  }
  if (next) {
    bucketDeltas.push({ categoryId: next.category_id ?? null, delta: Number(next.amount) || 0 });
  }
  patchBootstrapForAccumulation(qc, userId, totalDelta, bucketDeltas);
}

/**
 * Итог мутации цели: список ['goals', userId] патчится серверной строкой;
 * bootstrap.goals — upsert/remove по categoryId (unique user_id+category_id в
 * схеме гарантирует единство цели на категорию).
 */
export function settleGoalMutation(
  qc: QueryClient,
  userId: string,
  params: {
    previous: Goal | null;
    next: Goal | null;
    optimisticId?: string;
  },
): void {
  const { previous, next, optimisticId } = params;
  const key = goalsQueryKey(userId);

  if (qc.getQueryData<Goal[]>(key) === undefined) {
    qc.invalidateQueries({ queryKey: key, exact: true });
  } else {
    qc.setQueryData<Goal[]>(key, (items = []) => {
      const result = items.filter(
        (item) =>
          item.id !== optimisticId &&
          !(next === null && previous !== null && item.id === previous.id),
      );
      if (next) {
        const at = result.findIndex((item) => item.id === next.id);
        if (at === -1) result.push(next);
        else result[at] = next;
      }
      return result;
    });
  }

  qc.setQueryData<UseBootstrapResponse>(bootstrapQueryKey, (bootstrap) => {
    if (!bootstrap) return bootstrap;
    if (next === null) {
      if (!previous) return bootstrap;
      return {
        ...bootstrap,
        goals: bootstrap.goals.filter((item) => item.categoryId !== previous.category_id),
      };
    }
    const entry = {
      categoryId: next.category_id,
      amount: Number(next.amount) || 0,
    };
    const at = bootstrap.goals.findIndex((item) => item.categoryId === entry.categoryId);
    const goals = [...bootstrap.goals];
    if (at === -1) goals.push(entry);
    else goals[at] = entry;
    return { ...bootstrap, goals };
  });
}
