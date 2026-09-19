import { useAuth } from '@/shared/api/authProvider';
import commonStyles from '@/shared/styles/common.module.css';
import type { AdminUserRow } from './api/useAdminUsers';
import { ClearIcon, TrashIcon } from '@/shared/icons';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VSkeleton } from '@/shared/ui/VSkeleton';
import { VTextInput } from '@/shared/ui/VTextInput';
import { formatDisplay } from '@/shared/utils/date';
import { formatAmount } from '@/shared/utils/format';
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
  { key: 'operationsCount', label: 'Операции', sortType: 'number' },
  { key: 'categoriesCount', label: 'Категории', sortType: 'number' },
  { key: 'accountsCount', label: 'Счета', sortType: 'number' },
  { key: 'goalsCount', label: 'Цели', sortType: 'number' },
];

const formatDate = (value: string | null): string =>
  value ? formatDisplay(value.slice(0, 10)) : '—';

const cellToString = (row: AdminUserRow, key: ColumnKey): string => {
  const value = row[key];
  switch (key) {
    case 'login':
      return String(value).toLowerCase();
    case 'last_active_at':
      return formatDate(value as string | null).toLowerCase();
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
    key === sortKey ? (sortDirection === 'asc' ? '↑' : '↓') : '';

  if (usersQuery.isLoading) {
    return (
      <div className={commonStyles.page}>
        <VSkeleton width={360} height={38} radius="var(--md-sys-shape-corner-small)" />
        <div className={styles.tableWrapper}>
          <table className={styles.table} aria-busy="true">
            <caption className={styles.caption}>Пользователи</caption>
            <thead>
              <tr>
                {COLUMNS.map(({ key, label, sortType }) => (
                  <th
                    key={key}
                    scope="col"
                    className={sortType === 'number' ? styles.thRight : undefined}
                  >
                    {label}
                  </th>
                ))}
                <th scope="col">Действие</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: COLUMNS.length + 1 }, (_, cellIndex) => (
                    <td key={cellIndex} className={cellIndex >= 2 && cellIndex <= 6 ? styles.numCell : undefined}>
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
      <div className={styles.searchWrapper}>
        <VTextInput
          value={search}
          onChange={setSearch}
          placeholder="Поиск по всем колонкам…"
          className={styles.search}
        />
        {search && (
          <button
            type="button"
            className={styles.clearSearch}
            aria-label="Очистить поиск"
            onClick={() => setSearch('')}
          >
            <ClearIcon size={16} />
          </button>
        )}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <caption className={styles.caption}>Пользователи</caption>
          <thead>
            <tr>
              {COLUMNS.map(({ key, label, sortType }) => {
                const isNum = sortType === 'number';
                return (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={
                      key === sortKey
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    className={`${key === sortKey ? styles.sorted : ''}${isNum ? ` ${styles.thRight}` : ''}`.trim() || undefined}
                  >
                    <button
                      type="button"
                      className={`${styles.sortButton}${isNum ? ` ${styles.sortButtonRight}` : ''}`}
                      onClick={() => handleSort(key)}
                      aria-label={`Сортировать по «${label}»`}
                    >
                      <span>{label}</span>
                      <span className={styles.sortIndicator} aria-hidden="true">
                        {sortIndicator(key)}
                      </span>
                    </button>
                  </th>
                );
              })}
              <th scope="col">Действие</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className={styles.empty}>
                  {search ? (
                    <div className={styles.emptySearch}>
                      <span>Ничего не найдено по запросу «{search}»</span>
                      <button
                        type="button"
                        className={styles.resetFilterButton}
                        onClick={() => setSearch('')}
                      >
                        Сбросить поиск
                      </button>
                    </div>
                  ) : (
                    'Пользователи не найдены'
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.user_id}>
                  <td>{row.login}</td>
                  <td>{formatDate(row.last_active_at)}</td>
                  <td className={styles.numCell}>{formatAmount(row.operationsCount)}</td>
                  <td className={styles.numCell}>{formatAmount(row.categoriesCount)}</td>
                  <td className={styles.numCell}>{formatAmount(row.accountsCount)}</td>
                  <td className={styles.numCell}>{formatAmount(row.goalsCount)}</td>
                  <td className={styles.actionCell}>
                    {row.user_id !== current?.id && (
                      <VIconButton
                        ariaLabel={`Удалить ${row.login}`}
                        color="var(--md-sys-color-error)"
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
