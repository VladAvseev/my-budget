import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import type { ChartPoint } from '../utils/buildGrowthChartData';
import { formatAmount } from '@/shared/utils/format';
import { useCurrency } from '@/shared/hooks';
import styles from './GrowthChart.module.css';

interface GrowthChartProps {
  data: ChartPoint[];
  color: string;
  height?: number;
}

const PADDING = { top: 12, right: 8, bottom: 74 , left: 6 };
const GRID_LINES = 8;
const POINT_SPACING = 24  ;

interface TooltipState {
  x: number;
  y: number;
  point: ChartPoint;
}

export const GrowthChart = ({ data, color, height = 280 }: GrowthChartProps) => {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currency = useCurrency();

  useEffect(() => {
    const el = containerRef.current;
    if (el && el.scrollWidth > el.clientWidth) {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    }
  }, [data]);

  const { niceMin, niceMax, ticks } = useMemo(() => {
    if (data.length === 0) {
      return { niceMin: 0, niceMax: 100, ticks: [0, 25, 50, 75, 100] };
    }
    const values = data.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    if (min === max) {
      const pad = Math.abs(min) * 0.1 || 10;
      return {
        niceMin: min - pad,
        niceMax: max + pad,
        ticks: [min - pad, min, max + pad],
      };
    }

    const range = max - min;
    const rawStep = range / GRID_LINES;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const residual = rawStep / magnitude;
    let step: number;
    if (residual <= 1.5) step = magnitude;
    else if (residual <= 3) step = 2 * magnitude;
    else if (residual <= 7) step = 5 * magnitude;
    else step = 10 * magnitude;

    const nMin = Math.round(Math.floor(min / step) * step);
    const nMax = Math.round(Math.ceil(max / step) * step);
    const t: number[] = [];
    for (let v = nMin; v <= nMax; v += step) {
      t.push(Math.round(Math.round(v * 100) / 100));
    }

    return { niceMin: nMin, niceMax: nMax, ticks: t };
  }, [data]);

  const chartWidth = Math.max(1, data.length - 1) * POINT_SPACING;

  const svgWidth = chartWidth + PADDING.left + PADDING.right;
  const svgHeight = height + PADDING.top + PADDING.bottom;
  const plotWidth = chartWidth;
  const plotHeight = height;

  const getX = useCallback(
    (index: number) => {
      if (data.length <= 1) return PADDING.left + plotWidth / 2;
      return PADDING.left + (index / (data.length - 1)) * plotWidth;
    },
    [data.length, plotWidth],
  );

  const getY = useCallback(
    (value: number) => {
      if (niceMax === niceMin) return PADDING.top + plotHeight / 2;
      return PADDING.top + plotHeight - ((value - niceMin) / (niceMax - niceMin)) * plotHeight;
    },
    [niceMin, niceMax, plotHeight],
  );

  const linePath = useMemo(() => {
    return data
      .map((p, i) => {
        const x = getX(i);
        const y = getY(p.value);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  }, [data, getX, getY]);

  const areaPath = useMemo(() => {
    if (data.length === 0) return '';
    const top = data
      .map((p, i) => {
        const x = getX(i);
        const y = getY(p.value);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
    const bottomRight = `L${getX(data.length - 1)},${PADDING.top + plotHeight}`;
    const bottomLeft = `L${getX(0)},${PADDING.top + plotHeight}`;
    return `${top} ${bottomRight} ${bottomLeft} Z`;
  }, [data, getX, getY, plotHeight]);

  const handleDotEnter = useCallback(
    (e: React.MouseEvent, point: ChartPoint) => {
      const svgRect = (e.target as SVGCircleElement).closest('svg')?.getBoundingClientRect();
      if (!svgRect) return;
      const idx = data.indexOf(point);
      const x = getX(idx);
      const y = getY(point.value);
      setTooltip({
        x: svgRect.left + x,
        y: svgRect.top + y - 12,
        point,
      });
    },
    [data, getX, getY],
  );

  const handleDotLeave = useCallback(() => setTooltip(null), []);

  if (data.length === 0) {
    return <div className={styles.empty}>Нет данных для отображения</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container} ref={containerRef}>
        <div className={styles.chartWrap}>
          <svg
          className={styles.chart}
          width={svgWidth}
          height={svgHeight}
        >
          {ticks.map((tick, i) => {
            const y = getY(tick);
            return (
              <line
                key={`${tick}-${i}`}
                className={styles.gridLine}
                x1={PADDING.left}
                y1={y}
                x2={PADDING.left + plotWidth}
                y2={y}
              />
            );
          })}

          <line
            className={styles.axisLine}
            x1={PADDING.left}
            y1={PADDING.top + plotHeight}
            x2={PADDING.left + plotWidth}
            y2={PADDING.top + plotHeight}
          />

          <path d={areaPath} fill={color} opacity={0.12} />

          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((point, i) => {
            const x = getX(i);
            const y = getY(point.value);
            return (
              <circle
                key={i}
                className={styles.dot}
                cx={x}
                cy={y}
                r={4}
                fill={color}
                stroke="var(--color-bg-primary)"
                onMouseEnter={(e) => handleDotEnter(e, point)}
                onMouseLeave={handleDotLeave}
              />
            );
          })}

          {data.map((point, i) => {
            const x = getX(i) + 6;
            const y = PADDING.top + plotHeight + 14;
            return (
              <text
                key={i}
                className={styles.labelX}
                x={x}
                y={y}
                transform={`rotate(-90, ${x}, ${y})`}
              >
                {point.label}
              </text>
            );
          })}
        </svg>
        </div>
      </div>

      <div className={styles.yAxis} style={{ height: svgHeight }}>
        <span className={styles.labelYGhost}>
          {formatAmount(ticks.length > 0 ? Math.max(...ticks.map(t => Math.abs(t))) : 0, currency?.symbol)}
        </span>
        {[...ticks].reverse().map((tick, i) => (
          <span
            key={`${tick}-${i}`}
            className={styles.labelY}
            style={{ top: getY(tick), transform: 'translateY(-50%)' }}
          >
            {formatAmount(tick, currency?.symbol)}
          </span>
        ))}
      </div>

      {tooltip && (
        <div
          className={styles.tooltip}
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <span className={styles.tooltipValue}>{formatAmount(tooltip.point.value, currency?.symbol)}</span>
        </div>
      )}
    </div>
  );
};
