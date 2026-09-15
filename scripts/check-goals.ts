import assert from 'node:assert/strict';
import { buildCapitalChartData } from '../src/shared/utils/buildCapitalChartData';
import { buildRecentMonthlyGrowth, buildGrowthStats } from '../src/shared/utils/buildGrowthStats';
import { buildGoalsProgress, buildGoalsOverallProgress, buildGoalForecast, forecastAchievement, currentGoalContributions } from '../src/modules/_capital/utils/goals';
import type { Goal, Account, Operation } from '../src/shared/api/types/domain';

const now = new Date(2026, 8, 15);
for (const count of [0, 1, 11, 12, 13]) {
  for (const delta of [-100, 0, 100]) {
    const months = Array.from({ length: count }, (_, i) => {
      const date = new Date(2026, 8 - count + i, 1);
      return { month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, delta };
    });
    const data = buildCapitalChartData({ months, base: 10000, now });
    const growth = buildRecentMonthlyGrowth(data, 10000, { now });
    assert.equal(growth.months, Math.min(count, 12));
    assert.equal(growth.avg, count ? delta : null);
    for (const mode of ['total', 'period'] as const) {
      const stats = buildGrowthStats(data, 'M', 10000, mode, { now });
      assert.equal((stats.recent ?? stats.monthly)?.abs ?? null, growth.avg);
    }
  }
}
const points = buildCapitalChartData({ base: 10000, now, months: [
  { month: '2026-06', delta: 300 }, { month: '2026-08', delta: 900 }, { month: '2026-09', delta: 99999 },
] });
assert.equal(buildRecentMonthlyGrowth(points, 10000, { now }).avg, 400);
assert.deepEqual(buildRecentMonthlyGrowth(points, 10000, { now, firstActivityDate: new Date(2026, 5, 15) }), { avg: 450, months: 2 });
assert.equal(buildGrowthStats(points, 'M', 10000, 'total', { now, firstActivityDate: new Date(2026, 5, 15) }).monthly?.abs, 450);
const variable = buildCapitalChartData({ base: 10000, now, months: Array.from({ length: 13 }, (_, i) => {
 const d = new Date(2025, 7 + i, 1);
 return { month: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, delta: i === 0 ? 100000 : 200 };
}) });
assert.equal(buildRecentMonthlyGrowth(variable, 10000, { now }).avg, 200);
assert.equal(buildGrowthStats(variable, 'M', 10000, 'total', { now }).recent?.abs, 200);
const goal = { id: 'g', account_id: 'a', user_id: 'u', amount: 1000, target_date: '2026-12-01' } as Goal;
const account = { id: 'a', balance: -100, is_closed: false } as Account;
let progress = buildGoalsProgress([goal], [account], now);
assert.equal(progress[0].percent, 0);
assert.equal(buildGoalsOverallProgress(progress).totalSaved, 0);
assert.deepEqual(buildGoalsProgress([goal], [{ ...account, is_closed: true }], now), []);
progress = buildGoalsProgress([goal], [{ ...account, balance: 1500 }], now);
assert.equal(progress[0].percent, 100);
assert.equal(progress[0].reached, true);
assert.equal(buildGoalsOverallProgress(progress).totalSaved, 1000);
assert.deepEqual(forecastAchievement(1000, 400, now), { months: 3, date: '2026-12-01' });
for (const avg of [null, 0, -100]) assert.equal(forecastAchievement(1000, avg, now), null);
assert.equal(forecastAchievement(0, 100, now), null);
assert.equal(forecastAchievement(1000, Number.MIN_VALUE, now), null);
assert.equal(buildGoalForecast(goal, 100, now).requiredMonthly, 300);
assert.equal(buildGoalForecast({ ...goal, target_date: '2026-12-02' }, 100, now).requiredMonthly, 225);
assert.equal(buildGoalForecast({ ...goal, target_date: '2026-01-01' }, 100, now).requiredMonthly, null);
const operationBase = {
  report_id: 'r',
  user_id: 'u',
  category_id: null,
  description: null,
  date: null,
  created_at: '',
  updated_at: '',
} as const;
const operations: Operation[] = [
  {
    ...operationBase,
    id: 'op1',
    type: 'transfer',
    amount: 200,
    account_id: null,
    from_account_id: 'a',
    to_account_id: 'b',
  },
  {
    ...operationBase,
    id: 'op2',
    type: 'transfer',
    amount: 300,
    account_id: null,
    from_account_id: 'c',
    to_account_id: 'a',
  },
  {
    ...operationBase,
    id: 'op3',
    type: 'income',
    amount: 150,
    account_id: 'b',
    from_account_id: null,
    to_account_id: null,
  },
  {
    ...operationBase,
    id: 'op4',
    type: 'expense',
    amount: 40,
    account_id: 'a',
    from_account_id: null,
    to_account_id: null,
  },
];
assert.equal(currentGoalContributions(operations, new Set(['a', 'b'])), 410);
console.warn('Проверки целей: история 0/1/11/12/13 месяцев, окно, стартовый баланс, неполные и нулевые месяцы, прогресс, даты и нетто переводов — успешно.');
