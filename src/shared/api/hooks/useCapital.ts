import { useAccounts } from '@/shared/api/hooks/useAccounts';

/** Общий источник капитала для шапки, главной и аналитики. */
export const useCapital = (userId: string) => {
  const query = useAccounts(userId);
  const accounts = (query.data ?? [])
    .filter((account) => !account.is_closed)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || b.balance - a.balance)
    .map((account) => ({
      ...account,
      // Итог совпадает с суммой отображаемых балансов до копейки.
      cents: Math.round(Number(account.balance.toFixed(2)) * 100),
    }));
  return {
    ...query,
    accounts,
    capital: query.data ? accounts.reduce((sum, account) => sum + account.cents, 0) / 100 : null,
  };
};
