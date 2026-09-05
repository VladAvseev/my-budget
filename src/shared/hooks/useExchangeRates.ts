import { useQuery } from '@tanstack/react-query';

const API_BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';

interface CachedRates {
  date: string;
  rates: Record<string, number>;
}

const CACHE_KEY = 'exchangeRates_usd';
const today = () => new Date().toISOString().slice(0, 10);

export const useExchangeRates = () =>
  useQuery<Record<string, number>>({
    queryKey: ['exchangeRates'],
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    queryFn: async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedRates = JSON.parse(cached);
        if (parsed.date === today()) return parsed.rates;
      }

      const response = await fetch(`${API_BASE}/usd.json`);
      const data = await response.json();
      const rates = data.usd ?? {};
      localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today(), rates }));
      return rates;
    },
  });
