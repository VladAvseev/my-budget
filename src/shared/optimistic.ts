export interface OptimisticItem {
  _optimistic?: boolean;
}

export const createOptimisticId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `optimistic-${crypto.randomUUID()}`
    : `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const isOptimisticItem = <T,>(item: T): boolean =>
  Boolean((item as OptimisticItem)._optimistic);