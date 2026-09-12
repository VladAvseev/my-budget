import { useAuth } from '@/shared/api/authProvider';
import commonStyles from '@/shared/styles/common.module.css';
import type { AdminUserRow } from './api/useAdminUsers';
import { TrashIcon } from '@/shared/icons';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VSkeleton } from '@/shared/ui/VSkeleton';
import { VTextInput } from '@/shared/ui/VTextInput';
import { formatDisplay } from '@/shared/utils/date';
import { useMemo, useState } from 'react';
import { useAdminUsers } from './api/useAdminUsers';
import { DeleteUserModal } from './components/DeleteUserModal';
import styles from './page.module.css';

type SortDirection = 'asc' | 'desc';
type SortType = 'string' | 'date' | 'boolean' | 'number';
type ColumnKey = keyof Omit<AdminUserRow, 'user_id'>;

interface Column {
  key: ColumnKey;
  label: string;
  sortType: SortType;
}

const COLUMNS: Column[] = [
  { key: 'login', label: 'Пользователь', sortType: 'string' },
  { key: 'last_active_at', label: 'Активность', sortType: 'date' },
  { key: 'reportsCount', label: 'Периоды (еж)', sortType: 'number' },
  { key: 'operationsCount', label: 'Опер', sortType: 'number' },
  { key: 'incomeCount', label: 'Доходы', sortType: 'number' },
  { key: 'dailyCount', label: 'Еж. расходы', sortType: 'number' },
  { key: 'expenseCount', label: 'Расходы', sortType: 'number' },
  { key: 'savingsCount', label: 'Накопления', sortType: 'number' },
  { key: 'accumulationsCount', label: 'Накопления (нач)', sortType: 'number' },
  { key: 'categoriesCount', label: 'Категории', sortType: 'number' },
  { key: 'goalsCount', label: 'Цели', sortType: 'number' },
];

const formatDate = (value: string | null): string =>
  value ? formatDisplay(value.slice(0, 10)) : '—';

/** Периоды + доля периодов с ежедневными расходами: «12 (75%)». */
const formatPeriods = (row: AdminUserRow): string =>
  row.reportsCount > 0
    ? `${row.reportsCount} (${Math.round((row.dailyReportsCount / row.reportsCount) * 100)}%)`
    : String(row.reportsCount);

const cellToString = (row: AdminUserRow, key: ColumnKey): string => {
  const value = row[key];
  switch (key) {
    case 'login':
      return String(value).toLowerCase();
    case 'last_active_at':
      return formatDate(value as string | null).toLowerCase();
    case 'reportsCount':
      return formatPeriods(row).toLowerCase();
    default:
      return String(value).toLowerCase();
  }
};

const compareNonDate = (a: AdminUserRow, b: AdminUserRow, column: Column): number => {
  const av = a[column.key];
  const bv = b[column.key];
  switch (column.sortType) {
    case 'string':
      return String(av).localeCompare(String(bv), 'ru');
    case 'number':
      return (av as number) - (bv as number);
    case 'boolean':
      return Number(av) - Number(bv);
    default:
      return 0;
  }
};

const compareRows = (
  a: AdminUserRow,
  b: AdminUserRow,
  column: Column,
  direction: SortDirection,
) => {
  if (column.sortType === 'date') {
    const av = a[column.key] as string | null;
    const bv = b[column.key] as string | null;
    if (av && bv) {
      const diff = new Date(av).getTime() - new Date(bv).getTime();
      return direction === 'asc' ? diff : -diff;
    }
    if (av) return -1;
    if (bv) return 1;
    return 0;
  }
  const diff = compareNonDate(a, b, column);
  return direction === 'asc' ? diff : -diff;
};

export const Page: React.FC = () => {
  const { user: current } = useAuth();
  const usersQuery = useAdminUsers();
  const [search, setSearch] = useState('');
  const [deletingUser, setDeletingUser] = useState<AdminUserRow | null>(null);
  const [sortKey, setSortKey] = useState<ColumnKey>('last_active_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? (usersQuery.data ?? []).filter((row) =>
          COLUMNS.some(({ key }) => cellToString(row, key).includes(query)),
        )
      : (usersQuery.data ?? []);

    const column = COLUMNS.find(({ key }) => key === sortKey);
    if (!column) return filtered;

    return [...filtered].sort((a, b) => compareRows(a, b, column, sortDirection));
  }, [usersQuery.data, search, sortKey, sortDirection]);

  const handleSort = (key: ColumnKey) => {
    if (key === sortKey) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortIndicator = (key: ColumnKey): string =>
    key === sortKey ? (sortDirection === 'asc' ? '▲' : '▼') : '';

  if (usersQuery.isLoading) {
    return (
      <div className={commonStyles.page}>
        <VSkeleton width={360} height={38} radius="var(--radius-m)" />
        <div className={styles.tableWrapper}>
          <table className={styles.table} aria-busy="true">
            <thead>
              <tr>
                {COLUMNS.map(({ key, label }) => (
                  <th key={key}>{label}</th>
                ))}
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: COLUMNS.length + 1 }, (_, cellIndex) => (
                    <td key={cellIndex}>
                      <VSkeleton height={16} width={cellIndex === 0 ? 140 : 48} />
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

  if (usersQuery.isError) {
    return (
      <div className={commonStyles.page}>
        <VErrorCard
          title="Не удалось загрузить пользователей"
          error={usersQuery.error}
          onRetry={() => void usersQuery.refetch()}
          isRetrying={usersQuery.isFetching}
        />
      </div>
    );
  }

  return (
    <div className={commonStyles.page}>
      <VTextInput
        value={search}
        onChange={setSearch}
        placeholder="Поиск по всем колонкам"
        className={styles.search}
      />
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {COLUMNS.map(({ key, label }) => (
                <th key={key}>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => handleSort(key)}
                  >
                    {label}
                    <span className={styles.sortIndicator}>{sortIndicator(key)}</span>
                  </button>
                </th>
              ))}
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className={styles.empty}>
                  Пользователи не найдены
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.user_id}>
                  <td>{row.login}</td>
                  <td>{formatDate(row.last_active_at)}</td>
                  <td className={styles.numCell}>{formatPeriods(row)}</td>
                  <td className={styles.numCell}>{row.operationsCount}</td>
                  <td className={styles.numCell}>{row.incomeCount}</td>
                  <td className={styles.numCell}>{row.dailyCount}</td>
                  <td className={styles.numCell}>{row.expenseCount}</td>
                  <td className={styles.numCell}>{row.savingsCount}</td>
                  <td className={styles.numCell}>{row.accumulationsCount}</td>
                  <td className={styles.numCell}>{row.categoriesCount}</td>
                  <td className={styles.numCell}>{row.goalsCount}</td>
                  <td className={styles.actionCell}>
                    {row.user_id !== current?.id && (
                      <VIconButton
                        ariaLabel={`Удалить ${row.login}`}
                        color="var(--color-error)"
                        onClick={() => setDeletingUser(row)}
                      >
                        <TrashIcon size={18} color="currentColor" />
                      </VIconButton>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deletingUser && (
        <DeleteUserModal
          key={deletingUser.user_id}
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
};
