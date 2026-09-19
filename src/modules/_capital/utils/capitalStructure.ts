import type { Account } from '@/shared/api/types/domain';

export interface CapitalStructureSegment {
  key: string;
  label: string;
  color: string;
  total: number;
  percent: number;
  start: number;
  end: number;
}

export interface CapitalStructureData {
  segments: CapitalStructureSegment[];
  total: number;
  hasNegative: boolean;
}

export const ACCOUNT_COLOR_FALLBACK = 'var(--md-sys-color-outline-variant)';

export const buildCapitalStructureData = (accounts: Account[]): CapitalStructureData => {
  const open = accounts
    .filter((account) => !account.is_closed)
    .sort((a, b) => b.balance - a.balance);

  const total = open.reduce((sum, account) => sum + account.balance, 0);
  const hasNegative = open.some((account) => account.balance < 0);

  if (open.length === 0 || total <= 0 || hasNegative) {
    return { segments: [], total, hasNegative };
  }

  const segments: CapitalStructureSegment[] = [];
  let cursor = 0;

  open.forEach((account) => {
    if (account.balance <= 0) return;
    const percent = (account.balance / total) * 100;
    segments.push({
      key: account.id,
      label: account.name,
      color: account.color ?? ACCOUNT_COLOR_FALLBACK,
      total: account.balance,
      percent,
      start: cursor,
      end: cursor + percent,
    });
    cursor += percent;
  });

  return { segments, total, hasNegative: false };
};
