import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ChartPoint } from '@/shared/utils/chartPoints';
import styles from './VDeltaChart.module.css';

interface VDeltaChartProps {
  data: ChartPoint[];
  color?: string;
  height?: number;
  formatValue?: (value: number) => string;
}

const PADDING = { top: 12, right: 8, bottom: 80, left: 6 };
const GRID_LINES = 8;

const BAR_STEP = 24;
const BAR_WIDTH = 12;
const BAR_RADIUS = 4;
const ZERO_BAR_HEIGHT = 2;

interface TooltipState {
  x: number;
  y: number;
  point: ChartPoint;
}



export const VDeltaChart = ({
  data,
  color = 'var(--md-sys-color-primary)',
  height = 280,
  formatValue,
}: VDeltaChartProps) => {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [clampedX, setClampedX] = useState<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const format = formatValue ?? ((v: number) => String(Math.round(v)));

  useLayoutEffect(() => {
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
    const max = Math.max(...values);
    const min = Math.min(0, ...values);

    if (min === max) {
      const pad = Math.abs(max) * 0.1 || 10;
      return { niceMin: min - pad, niceMax: max + pad, ticks: [min - pad, max, max + pad] };
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

  const chartWidth = Math.max(1, data.length) * BAR_STEP;

  const svgWidth = chartWidth + PADDING.left + PADDING.right;
  const svgHeight = height + PADDING.top + PADDING.bottom;
  const plotWidth = chartWidth;
  const plotHeight = height;

  const getCenterX = useCallback(
    (index: number) => PADDING.left + index * BAR_STEP + BAR_STEP / 2,
    [],
  );

  const getY = useCallback(
    (value: number) => {
      if (niceMax === niceMin) return PADDING.top + plotHeight / 2;
      return PADDING.top + plotHeight - ((value - niceMin) / (niceMax - niceMin)) * plotHeight;
    },
    [niceMin, niceMax, plotHeight],
  );

  const baselineY = getY(Math.max(0, niceMin));

  const getBarX = useCallback(
    (idx: number) => {
      const el = containerRef.current;
      if (!el) return getCenterX(idx);
      const svgEl = el.querySelector('svg');
      if (!svgEl) return getCenterX(idx);
      const svgRect = svgEl.getBoundingClientRect();
      const wrapperRect = el.parentElement?.getBoundingClientRect();
      if (!wrapperRect) return getCenterX(idx);
      return svgRect.left + getCenterX(idx) - wrapperRect.left;
    },
    [getCenterX],
  );

  const handleBarEnter = useCallback(
    (point: ChartPoint) => {
      const idx = data.indexOf(point);
      setTooltip({ x: getBarX(idx), y: getY(point.value) - 12, point });
    },
    [data, getBarX, getY],
  );

  const handleBarLeave = useCallback(() => setTooltip(null), []);

  const handleScroll = useCallback(() => {
    setTooltip((prev) => {
      if (!prev) return null;
      const el = containerRef.current;
      if (!el) return null;
      const idx = data.indexOf(prev.point);
      const centerX = getCenterX(idx);
      if (centerX < el.scrollLeft || centerX > el.scrollLeft + el.clientWidth) {
        return null;
      }
      return { ...prev, x: getBarX(idx) };
    });
  }, [data, getCenterX, getBarX]);

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

            {data.map((point, i) => {
              const centerX = getCenterX(i);
              const valueY = getY(point.value);
              
              const barHeight = Math.max(Math.abs(valueY - baselineY), ZERO_BAR_HEIGHT);
              const y = valueY <= baselineY ? baselineY - barHeight : baselineY;
              return (
                <rect
                  key={i}
                  className={styles.bar}
                  x={centerX - BAR_WIDTH / 2}
                  y={y}
                  width={BAR_WIDTH}
                  height={barHeight}
                  rx={BAR_RADIUS}
                  fill={color}
                  tabIndex={0}
                  role="img"
                  aria-label={`${point.label}: ${format(point.value)}`}
                  onMouseEnter={() => handleBarEnter(point)}
                  onMouseLeave={handleBarLeave}
                  onFocus={() => handleBarEnter(point)}
                  onBlur={handleBarLeave}
                />
              );
            })}

            {data.map((point, i) => {
              const x = getCenterX(i) + 6;
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
        <span className={styles.labelYGhost}>{format(Math.max(...ticks.map((t) => Math.abs(t))))}</span>
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
          <div className={styles.tooltipLabel}>{tooltip.point.label}</div>
        </div>
      )}
    </div>
  );
};
