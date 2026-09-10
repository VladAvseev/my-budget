import type { ChartPoint } from '@/shared/utils/chartPoints';
import type { BuildLogsDynamicsResult } from './buildLogsDynamicsData';

/**
 * Подпись-статистика под графиком логов: среднее за час/день (по непрерывному
 * ряду, т.е. с нулями на пустые интервалы — «в среднем» за весь выбранный
 * период) и количество логов за последний час и последний день (последняя
 * точка соответствующего ряда).
 */
export interface LogsDynamicsStats {
  avgPerHour: number | null;
  avgPerDay: number | null;
  lastHour: number | null;
  lastDay: number | null;
}

const average = (series: ChartPoint[], total: number): number | null =>
  series.length > 0 ? total / series.length : null;

const lastValue = (series: ChartPoint[]): number | null =>
  series.length > 0 ? series[series.length - 1].value : null;

export const buildLogsDynamicsStats = ({
  hourSeries,
  daySeries,
  total,
}: BuildLogsDynamicsResult): LogsDynamicsStats => ({
  avgPerHour: average(hourSeries, total),
  avgPerDay: average(daySeries, total),
  lastHour: lastValue(hourSeries),
  lastDay: lastValue(daySeries),
});
