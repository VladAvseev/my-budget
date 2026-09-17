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



export const CAPITAL_PALETTE = [
  'var(--md-sys-color-primary)',
  'var(--md-sys-color-secondary)',
  'var(--md-sys-color-tertiary)',
  'var(--md-sys-color-primary-fixed-dim)',
  'var(--md-sys-color-secondary-fixed-dim)',
  'var(--md-sys-color-tertiary-fixed-dim)',
  'var(--md-sys-color-primary-container)',
  'var(--md-sys-color-secondary-container)',
] as const;


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

  open.forEach((account, index) => {
    
    if (account.balance <= 0) return;
    const percent = (account.balance / total) * 100;
    segments.push({
      key: account.id,
      label: account.name,
      color: CAPITAL_PALETTE[index % CAPITAL_PALETTE.length],
      total: account.balance,
      percent,
      start: cursor,
      end: cursor + percent,
    });
    cursor += percent;
  });

  return { segments, total, hasNegative: false };
};
