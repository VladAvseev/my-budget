import { useAtomValue } from 'jotai';
import { useCurrency, useExchangeRates, useProfile } from '@/shared/api/hooks';
import { getCurrencyByCode, isQuickCurrency } from '@/shared/constants/currencies';
import { selectedDisplayCurrencyAtom } from '../atoms/overview';

export const useDisplayCurrency = () => {
  const selectedCurrency = useAtomValue(selectedDisplayCurrencyAtom);
  const currency = useCurrency();
  const { data: profile } = useProfile();
  const { data: rates } = useExchangeRates();

  const profileCurrency = profile?.currency ?? null;
  const defaultCurrency = isQuickCurrency(profileCurrency) ? profileCurrency : null;

  const displayCurrency = selectedCurrency && rates ? selectedCurrency : null;
  const displaySymbol = displayCurrency
    ? getCurrencyByCode(displayCurrency)?.symbol
    : currency?.symbol;

  const convertOptions =
    displayCurrency && rates && defaultCurrency
      ? { from: defaultCurrency, to: displayCurrency, rates }
      : undefined;

  return {
    selectedCurrency,
    defaultCurrency,
    isCurrencyDisabled: defaultCurrency === null,
    displayCurrency,
    displaySymbol,
    rates,
    convertOptions,
  };
};
