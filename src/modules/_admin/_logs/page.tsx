import commonStyles from '@/shared/styles/common.module.css';
import type {
  AdminLogRow,
  AdminLogsPeriod,
  AdminLogsStatusFilter,
} from '@/shared/api/types/domain';
import { VButton } from '@/shared/ui/VButton';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { useAtom } from 'jotai';
import { Fragment, useState } from 'react';
import { ADMIN_LOGS_LIMIT, useAdminLogs } from './api/useAdminLogs';
import { useAdminLogsMetrics } from './api/useAdminLogsMetrics';
import { logsPageAtom, logsPeriodAtom, logsStatusAtom } from './atoms/logs';
import styles from './page.module.css';

const PERIOD_OPTIONS: VButtonGroupOption[] = [
  { value: '24h', label: '24 часа' },
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: 'all', label: 'Всё' },
];

const STATUS_OPTIONS: VButtonGroupOption[] = [
  { value: 'all', label: 'Все' },
  { value: 'success', label: 'Успешные' },
  { value: 'error', label: 'С ошибкой' },
];

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const formatDateTime = (iso: string): string => dateTimeFormatter.format(new Date(iso));

/** Точка динамики: для 24h — «ДД.ММ ЧЧ:00», иначе «ДД.ММ». */
const formatSeriesPoint = (iso: string, hourly: boolean): string => {
  const date = new Date(iso);
  const dayMonth = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
  if (!hourly) {
    return dayMonth;
  }
  return `${dayMonth} ${String(date.getHours()).padStart(2, '0')}:00`;
};

const formatJson = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '—';
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const formatNumber = (value: number): string => value.toLocaleString('ru-RU');

const formatMetric = (value: number | null, suffix = ''): string =>
  value === null ? '—' : `${formatNumber(value)}${suffix}`;

interface MetricCardProps {
  label: string;
  value: string;
  isError?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, isError }) => (
  <VCard className={styles.metricCard}>
    <span className={styles.metricLabel}>{label}</span>
    <span className={isError ? styles.metricValueError : styles.metricValue}>{value}</span>
  </VCard>
);

interface EndpointListProps {
  title: string;
  items: { endpoint: string; count: number; avgDurationMs: number; errorCount: number }[];
}

const EndpointList: React.FC<EndpointListProps> = ({ title, items }) => (
  <VCard className={styles.detailsBlock}>
    <span className={styles.detailsTitle}>{title}</span>
    {items.length === 0 ? (
      <span className={commonStyles.textSecondary}>Нет данных за период</span>
    ) : (
      <table className={styles.endpointTable}>
        <thead>
          <tr>
            <th>Эндпоинт</th>
            <th>Запросов</th>
            <th>Ср. время</th>
            <th>Ошибок</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.endpoint}>
              <td>{item.endpoint}</td>
              <td>{formatNumber(item.count)}</td>
              <td>{formatNumber(item.avgDurationMs)} мс</td>
              <td className={item.errorCount > 0 ? styles.errorText : undefined}>
                {formatNumber(item.errorCount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </VCard>
);

export const Page: React.FC = () => {
  const [period, setPeriod] = useAtom(logsPeriodAtom);
  const [status, setStatus] = useAtom(logsStatusAtom);
  const [page, setPage] = useAtom(logsPageAtom);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const metricsQuery = useAdminLogsMetrics(period as AdminLogsPeriod);
  const logsQuery = useAdminLogs({ status: status as AdminLogsStatusFilter, page });

  const toggleRow = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const metrics = metricsQuery.data;
  const logs = logsQuery.data;
  const totalPages = logs ? Math.max(1, Math.ceil(logs.total / ADMIN_LOGS_LIMIT)) : 1;

  if (metricsQuery.isLoading || logsQuery.isLoading) {
    return (
      <div className={commonStyles.loaderContainer}>
        <VLoader size={28} />
      </div>
    );
  }

  if (metricsQuery.isError || !metrics) {
    return (
      <div className={commonStyles.page}>
        <div className={commonStyles.textSecondary}>Не удалось загрузить метрики логов</div>
      </div>
    );
  }

  return (
    <div className={commonStyles.page}>
      <div className={commonStyles.row}>
        <VButtonGroup
          options={PERIOD_OPTIONS}
          value={period}
          onChange={(value) => setPeriod(value as AdminLogsPeriod)}
          label="Период метрик"
        />
      </div>

      <div className={styles.metricsGrid}>
        <MetricCard label="Запросов" value={formatNumber(metrics.total)} />
        <MetricCard label="Успешных" value={formatNumber(metrics.successCount)} />
        <MetricCard
          label="Ошибок"
          value={formatNumber(metrics.errorCount)}
          isError={metrics.errorCount > 0}
        />
        <MetricCard
          label="Доля ошибок"
          value={metrics.errorRate === null ? '—' : `${Math.round(metrics.errorRate * 100)}%`}
        />
        <MetricCard label="Ср. время" value={formatMetric(metrics.avgDurationMs, ' мс')} />
        <MetricCard label="p95" value={formatMetric(metrics.p95DurationMs, ' мс')} />
      </div>

      {metrics.perPoint.length > 0 && (
        <VCard className={styles.detailsBlock}>
          <span className={styles.detailsTitle}>
            Динамика {period === '24h' ? 'по часам' : 'по дням'} (всего / ошибок)
          </span>
          <div className={styles.tableWrapper}>
            <table className={styles.seriesTable}>
              <thead>
                <tr>
                  <th>Период</th>
                  <th>Запросов</th>
                  <th>Ошибок</th>
                </tr>
              </thead>
              <tbody>
                {metrics.perPoint.map((point) => (
                  <tr key={point.point}>
                    <td>{formatSeriesPoint(point.point, period === '24h')}</td>
                    <td>{formatNumber(point.total)}</td>
                    <td className={point.errors > 0 ? styles.errorText : undefined}>
                      {formatNumber(point.errors)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </VCard>
      )}

      <div className={styles.twoCol}>
        <EndpointList title="Самые медленные эндпоинты" items={metrics.topSlowestEndpoints} />
        <EndpointList title="Больше всего ошибок" items={metrics.topErrorEndpoints} />
      </div>

      <div className={commonStyles.columnL}>
        <div className={styles.toolbar}>
          <VButtonGroup
            options={STATUS_OPTIONS}
            value={status}
            onChange={(value) => {
              setStatus(value as AdminLogsStatusFilter);
              setPage(1);
            }}
            label="Логи"
          />
        </div>

        {logsQuery.isError || !logs ? (
          <div className={commonStyles.textSecondary}>Не удалось загрузить логи</div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Время</th>
                    <th>Метод</th>
                    <th>Путь</th>
                    <th>Статус</th>
                    <th>Время</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.empty}>
                        Логи не найдены
                      </td>
                    </tr>
                  ) : (
                    logs.items.map((row: AdminLogRow) => {
                      const isError = row.status >= 400;
                      const isExpanded = expandedIds.has(row.id);
                      return (
                        <Fragment key={row.id}>
                          <tr
                            className={styles.rowClickable}
                            onClick={() => toggleRow(row.id)}
                          >
                            <td>{formatDateTime(row.createdAt)}</td>
                            <td>{row.method}</td>
                            <td>{row.path}</td>
                            <td className={isError ? styles.statusError : styles.statusOk}>
                              {row.status}
                            </td>
                            <td>{formatNumber(row.durationMs)} мс</td>
                            <td>{row.ip ?? '—'}</td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className={styles.detailsCell}>
                                <div className={styles.detailsGrid}>
                                  <div className={styles.detailsBlock}>
                                    <span className={styles.detailsTitle}>Тело запроса</span>
                                    <pre className={styles.detailsCode}>
                                      {formatJson(row.body)}
                                    </pre>
                                  </div>
                                  <div className={styles.detailsBlock}>
                                    <span className={styles.detailsTitle}>Ответ сервера</span>
                                    <pre className={styles.detailsCode}>
                                      {formatJson(row.responseBody)}
                                    </pre>
                                  </div>
                                  {row.error && (
                                    <div className={styles.detailsBlock}>
                                      <span className={styles.detailsTitle}>Ошибка</span>
                                      <pre className={`${styles.detailsCode} ${styles.errorText}`}>
                                        {row.error}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <VButton
                variant="secondary"
                isDisabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                ← Назад
              </VButton>
              <span className={styles.paginationInfo}>
                Стр. {logs.page} из {totalPages} · всего {formatNumber(logs.total)}
              </span>
              <VButton
                variant="secondary"
                isDisabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Вперёд →
              </VButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
