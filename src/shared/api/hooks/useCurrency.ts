import { getCurrencyByCode, type Currency } from '@/shared/constants/currencies';
import { useProfile } from './useProfile';

export const useCurrency = (): Currency | null => {
  const { data: profile } = useProfile();
  return getCurrencyByCode(profile?.currency ?? null) ?? null;
};
