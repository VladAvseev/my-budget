import type { BuildLogsDynamicsResult } from './buildLogsDynamicsData';

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
