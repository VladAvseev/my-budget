import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';

interface CachedRates {
  date: string;
  rates: Record<string, number>;
}

const CACHE_KEY = 'exchangeRates_usd';
const today = () => new Date().toISOString().slice(0, 10);

/** Ответ внешнего курса: код валюты → множитель к USD (данные не из нашего API). */
export type UseExchangeRatesResponse = Record<string, number>;

export const useExchangeRates = () =>
  useQuery<UseExchangeRatesResponse>({
    queryKey: ['exchangeRates'],
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedRates = JSON.parse(cached);
        if (parsed.date === today()) return parsed.rates;
      }

      const { data } = await axios.get<{ usd?: Record<string, number> }>(`${API_BASE}/usd.json`, {
        signal,
      });
      const rates = data.usd ?? {};
      localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today(), rates }));
      return rates;
    },
  });
