import { useMemo, useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import type { ChartPoint } from '../utils/buildGrowthChartData';
import { getPointChange } from '../utils/buildGrowthChartData';
import { formatAmount } from '@/shared/utils/format';
import { useCurrency } from '@/shared/hooks';
import styles from './GrowthChart.module.css';

interface GrowthChartProps {
  data: ChartPoint[];
  color: string;
  height?: number;
  formatValue?: (value: number) => string;
  showChange?: boolean;
  displaySymbol?: string;
  base?: number;
}

const PADDING = { top: 12, right: 8, bottom: 80, left: 6 };
const GRID_LINES = 8;
const POINT_SPACING = 24;

interface TooltipState {
  x: number;
  y: number;
  point: ChartPoint;
}

export const GrowthChart = ({
  data,
  color,
  height = 280,
  formatValue,
  showChange,
  displaySymbol,
  base = 0,
}: GrowthChartProps) => {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [clampedX, setClampedX] = useState<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currency = useCurrency();

  const format = formatValue ?? ((v: number) => formatAmount(v, displaySymbol ?? currency?.symbol));

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

  const getDotX = useCallback(
    (idx: number) => {
      const el = containerRef.current;
      if (!el) return getX(idx);
      const svgEl = el.querySelector('svg');
      if (!svgEl) return getX(idx);
      const svgRect = svgEl.getBoundingClientRect();
      const wrapperRect = el.parentElement?.getBoundingClientRect();
      if (!wrapperRect) return getX(idx);
      return svgRect.left + getX(idx) - wrapperRect.left;
    },
    [getX],
  );

  const handleDotEnter = useCallback(
    (_e: React.MouseEvent, point: ChartPoint) => {
      const idx = data.indexOf(point);
      setTooltip({
        x: getDotX(idx),
        y: getY(point.value) - 12,
        point,
      });
    },
    [data, getDotX, getY],
  );

  const handleDotLeave = useCallback(() => setTooltip(null), []);

  const handleScroll = useCallback(() => {
    setTooltip((prev) => {
      if (!prev) return null;
      const el = containerRef.current;
      if (!el) return null;
      const idx = data.indexOf(prev.point);
      const dotX = getX(idx);
      if (dotX < el.scrollLeft || dotX > el.scrollLeft + el.clientWidth) {
        return null;
      }
      return {
        ...prev,
        x: getDotX(idx),
      };
    });
  }, [data, getX, getDotX]);

  useLayoutEffect(() => {
    if (!tooltip || !tooltipRef.current) {
      setClampedX(null);
      return;
    }
    const el = tooltipRef.current;
    const wrapper = el.parentElement;
    if (!wrapper) return;

    const tooltipRect = el.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const halfW = tooltipRect.width / 2;
    const wrapperWidth = wrapperRect.width;

    let x = tooltip.x;
    if (x - halfW < 0) x = halfW;
    if (x + halfW > wrapperWidth) x = wrapperWidth - halfW;

    setClampedX(x !== tooltip.x ? x : null);
  }, [tooltip]);

  if (data.length === 0) {
    return <div className={styles.empty}>Нет данных для отображения</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container} ref={containerRef} onScroll={handleScroll}>
        <div className={styles.chartWrap}>
          <svg className={styles.chart} width={svgWidth} height={svgHeight}>
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
          {format(ticks.length > 0 ? Math.max(...ticks.map((t) => Math.abs(t))) : 0)}
        </span>
        {[...ticks].reverse().map((tick, i) => (
          <span
            key={`${tick}-${i}`}
            className={styles.labelY}
            style={{ top: getY(tick), transform: 'translateY(-50%)' }}
          >
            {format(tick)}
          </span>
        ))}
      </div>

      {tooltip && (
        <div
          ref={tooltipRef}
          className={styles.tooltip}
          style={{
            left: clampedX ?? tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <span className={styles.tooltipValue}>{format(tooltip.point.value)}</span>
          {showChange &&
            (() => {
              const change = getPointChange(data, data.indexOf(tooltip.point), base);
              if (!change) return null;
              const changeColor =
                change.abs > 0
                  ? 'var(--color-success)'
                  : change.abs < 0
                    ? 'var(--color-error)'
                    : 'var(--color-warning)';
              const sign = change.abs > 0 ? '+' : change.abs < 0 ? '' : '±';
              return (
                <div className={styles.tooltipChange} style={{ color: changeColor }}>
                  {sign}
                  {format(change.abs)}
                  {change.pct !== null &&
                    ` (${change.pct > 0 ? '+' : ''}${change.pct.toFixed(1)}%)`}
                </div>
              );
            })()}
          <div className={styles.tooltipLabel}>{tooltip.point.label}</div>
        </div>
      )}
    </div>
  );
};
