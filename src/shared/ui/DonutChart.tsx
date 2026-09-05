import { useState, useCallback } from 'react';
import { formatAmount } from '@/shared/utils/format';
import { useCurrency } from '@/shared/hooks';
import styles from './DonutChart.module.css';

export interface DonutSegment {
  key: string;
  label: string;
  color: string;
  total: number;
  convertedTotal?: number;
  percent: number;
  start: number;
  end: number;
}

interface DonutChartProps {
  segments: DonutSegment[];
  total: number;
  size?: number;
  thickness?: number;
  maskAmounts?: boolean;
  displayTotal?: number;
  displaySymbol?: string;
}

const FULL_CIRCLE = 360;

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string => {
  const sweep = Math.min(endAngle - startAngle, FULL_CIRCLE - 0.01);

  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, startAngle + sweep);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle + sweep);
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle);

  const largeArc = sweep > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
};

interface TooltipState {
  x: number;
  y: number;
  segment: DonutSegment;
}

export const DonutChart = ({
  segments,
  total,
  size = 280,
  thickness = 60,
  maskAmounts = false,
  displayTotal,
  displaySymbol,
}: DonutChartProps) => {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const currency = useCurrency();

  const symbol = displaySymbol ?? currency?.symbol;

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2;
  const innerR = outerR - thickness;
  const midR = (outerR + innerR) / 2;

  const handleSegmentEnter = useCallback(
    (_e: React.MouseEvent, segment: DonutSegment) => {
      const midAngleDeg = ((segment.start + segment.end) / 2 / 100) * FULL_CIRCLE;
      const midPoint = polarToCartesian(cx, cy, midR, midAngleDeg);

      setTooltip({
        x: midPoint.x,
        y: midPoint.y,
        segment,
      });
    },
    [cx, cy, midR],
  );

  const handleSegmentLeave = useCallback(() => setTooltip(null), []);

  if (segments.length === 0 || total <= 0) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.chart}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {segments.map((segment) => {
          const startAngle = (segment.start / 100) * FULL_CIRCLE;
          const endAngle = (segment.end / 100) * FULL_CIRCLE;
          const d = describeArc(cx, cy, outerR, innerR, startAngle, endAngle);

          return (
            <path
              key={segment.key}
              className={styles.segment}
              d={d}
              fill={segment.color}
              onMouseEnter={(e) => handleSegmentEnter(e, segment)}
              onMouseLeave={handleSegmentLeave}
            />
          );
        })}
      </svg>

      <div className={styles.hole} style={{ width: innerR * 2, height: innerR * 2 }}>
        <span className={styles.total}>
          {maskAmounts ? '***' : formatAmount(displayTotal ?? total, symbol)}
        </span>
      </div>

      {tooltip && (
        <div
          className={styles.tooltip}
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className={styles.tooltipLabel}>{tooltip.segment.label}</div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipValue}>
              {maskAmounts ? '***' : formatAmount(tooltip.segment.convertedTotal ?? tooltip.segment.total, symbol)}
            </span>
            <span className={styles.tooltipPercent}>{tooltip.segment.percent.toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
