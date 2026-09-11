import commonStyles from '@/shared/styles/common.module.css';
import { VButton } from '@/shared/ui/VButton';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VCard } from '@/shared/ui/VCard';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VSkeleton } from '@/shared/ui/VSkeleton';
import { VSelect, type VSelectOption } from '@/shared/ui/VSelect';
import { VMultiSelect, type VMultiSelectOption } from '@/shared/ui/VMultiSelect';
import { useAtom } from 'jotai';
import { Fragment, useMemo, useState } from 'react';
import { useAdminUsers } from '../_users/api/useAdminUsers';
import { LogsDynamicsCard } from './components/LogsDynamicsCard';
import {
  ADMIN_LOGS_LIMIT,
  useAdminLogs,
  type AdminLogRow,
  type AdminLogsSortField,
  type AdminLogsSortOrder,
  type AdminLogsStatusFilter,
} from './api/useAdminLogs';
import { useAdminLogsMetrics, type AdminLogsPeriod } from './api/useAdminLogsMetrics';
import {
  LOG_USER_ANONYMOUS,
  logsMethodsAtom,
  logsPageAtom,
  logsPeriodAtom,
  logsSortAtom,
  logsSortOrderAtom,
  logsStatusAtom,
  logsUserAtom,
} from './atoms/logs';
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

/** Статический список методов для фильтра: сервер логирует только эти. */
const METHOD_OPTIONS: VMultiSelectOption[] = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DELETE' },
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
      <div className={styles.tableWrapper}>
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
      </div>
    )}
  </VCard>
);

interface SortHeaderProps {
  label: string;
  field: AdminLogsSortField;
  activeField: AdminLogsSortField;
  order: AdminLogsSortOrder;
  onSort: (field: AdminLogsSortField) => void;
}

/** Заголовок сортируемого столбца: клик — выбрать поле, повторный — сменить порядок. */
const SortHeader: React.FC<SortHeaderProps> = ({ label, field, activeField, order, onSort }) => (
  <th className={styles.sortHeader} onClick={() => onSort(field)}>
    {label}
    <span className={styles.sortIndicator}>
      {activeField === field ? (order === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  </th>
);

export const Page: React.FC = () => {
  const [period, setPeriod] = useAtom(logsPeriodAtom);
  const [status, setStatus] = useAtom(logsStatusAtom);
  const [user, setUser] = useAtom(logsUserAtom);
  const [methods, setMethods] = useAtom(logsMethodsAtom);
  const [page, setPage] = useAtom(logsPageAtom);
  const [sort, setSort] = useAtom(logsSortAtom);
  const [sortOrder, setSortOrder] = useAtom(logsSortOrderAtom);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const handleSort = (field: AdminLogsSortField) => {
    if (field === sort) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const usersQuery = useAdminUsers();
  const userOptions = useMemo<VSelectOption[]>(
    () => [
      { value: LOG_USER_ANONYMOUS, label: 'Без авторизации' },
      ...(usersQuery.data ?? []).map((row) => ({ value: row.user_id, label: row.email })),
    ],
    [usersQuery.data],
  );

  const metricsQuery = useAdminLogsMetrics(period as AdminLogsPeriod);
  const logsQuery = useAdminLogs({
    status: status as AdminLogsStatusFilter,
    userId: user,
    methods,
    page,
    sort,
    order: sortOrder,
  });

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
      <div className={commonStyles.page}>
        <LogsDynamicsCard />
        <div className={styles.metricsGrid} aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <VCard key={i} className={styles.metricCard}>
              <VSkeleton width={90} height={14} />
              <VSkeleton width={56} height={24} />
            </VCard>
          ))}
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата и время</th>
                <th>Метод</th>
                <th>Путь</th>
                <th>Статус</th>
                <th>Выполнение</th>
                <th>Пользователь</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: 7 }, (_, cellIndex) => (
                    <td key={cellIndex}>
                      <VSkeleton height={14} width={cellIndex === 2 ? 220 : 70} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (metricsQuery.isError || !metrics) {
    return (
      <div className={commonStyles.page}>
        <VErrorCard
          title="Не удалось загрузить метрики логов"
          error={metricsQuery.error}
          onRetry={() => void metricsQuery.refetch()}
          isRetrying={metricsQuery.isFetching}
        />
      </div>
    );
  }

  return (
    <div className={commonStyles.page}>
      <LogsDynamicsCard />

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
          <VSelect
            className={styles.userSelect}
            label="Пользователь"
            options={userOptions}
            value={user}
            emptyText="Все пользователи"
            onChange={(value) => {
              setUser(value);
              setPage(1);
            }}
          />
          <VMultiSelect
            className={styles.methodSelect}
            label="Метод"
            options={METHOD_OPTIONS}
            value={methods}
            emptyText="Все методы"
            onChange={(value) => {
              setMethods(value);
              setPage(1);
            }}
          />
        </div>

        {logsQuery.isError || !logs ? (
          <VErrorCard
            title="Не удалось загрузить логи"
            error={logsQuery.error}
            onRetry={() => void logsQuery.refetch()}
            isRetrying={logsQuery.isFetching}
          />
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <SortHeader
                      label="Дата и время"
                      field="date"
                      activeField={sort}
                      order={sortOrder}
                      onSort={handleSort}
                    />
                    <th>Метод</th>
                    <th>Путь</th>
                    <th>Статус</th>
                    <SortHeader
                      label="Выполнение"
                      field="duration"
                      activeField={sort}
                      order={sortOrder}
                      onSort={handleSort}
                    />
                    <th>Пользователь</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.empty}>
                        Логи не найдены
                      </td>
                    </tr>
                  ) : (
                    logs.items.map((row: AdminLogRow) => {
                      const isError = row.status >= 400;
                      // Раскрытие строки нужно только ради текста ошибки —
                      // параметров запроса сервер не хранит.
                      const isExpanded = row.error !== null && expandedIds.has(row.id);
                      return (
                        <Fragment key={row.id}>
                          <tr
                            className={row.error ? styles.rowClickable : undefined}
                            onClick={row.error ? () => toggleRow(row.id) : undefined}
                          >
                            <td>{formatDateTime(row.createdAt)}</td>
                            <td>{row.method}</td>
                            <td>{row.path}</td>
                            <td className={isError ? styles.statusError : styles.statusOk}>
                              {row.status}
                            </td>
                            <td>{formatNumber(row.durationMs)} мс</td>
                            <td>
                              {row.userEmail ?? (
                                <span className={styles.userAnonymous}>
                                  {row.isAuthenticated ? '—' : 'без авторизации'}
                                </span>
                              )}
                            </td>
                            <td>{row.ip ?? '—'}</td>
                          </tr>
                          {isExpanded && row.error && (
                            <tr>
                              <td colSpan={7} className={styles.detailsCell}>
                                <div className={styles.detailsBlock}>
                                  <span className={styles.detailsTitle}>Ошибка</span>
                                  <pre className={`${styles.detailsCode} ${styles.errorText}`}>
                                    {row.error}
                                  </pre>
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
