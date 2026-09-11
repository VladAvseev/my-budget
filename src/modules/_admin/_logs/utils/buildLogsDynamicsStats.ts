import type { BuildLogsDynamicsResult } from './buildLogsDynamicsData';

/**
 * Подпись-статистика под графиком логов: среднее по непрерывному ряду выбранного
 * бакета (с нулями на пустые интервалы) и значение за последний бакет.
 * Для metric=unique_users среднее считается как среднее почасовых/суточных
 * уникальных авторов, а не как total / число бакетов: один пользователь может
 * быть уникальным сразу в нескольких бакетах.
 */
export interface LogsDynamicsStats {
  avgPerBucket: number | null;
  lastBucket: number | null;
}

export const buildLogsDynamicsStats = ({
  chartData,
}: BuildLogsDynamicsResult): LogsDynamicsStats => {
  if (chartData.length === 0) {
    return { avgPerBucket: null, lastBucket: null };
  }

  let sum = 0;
  for (const point of chartData) {
    sum += point.value;
  }

  return {
    avgPerBucket: sum / chartData.length,
    lastBucket: chartData[chartData.length - 1].value,
  };
};
