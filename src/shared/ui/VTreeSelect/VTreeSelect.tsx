import { CheckIcon, ChevronDownIcon, ChevronRightIcon, ClearIcon } from '@/shared/icons';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './VTreeSelect.module.css';

export interface VTreeSelectLeaf {
  type: 'leaf';
  value: string;
  label: string;
  prefix?: ReactNode;
}

export interface VTreeSelectGroup {
  type: 'group';
  label: string;
  children: VTreeSelectItem[];
}

export type VTreeSelectItem = VTreeSelectLeaf | VTreeSelectGroup;

export interface VTreeSelectProps {
  label?: string;
  items: VTreeSelectItem[];
  value: string[];
  placeholder?: string;
  emptyText?: string;
  selectAll?: boolean;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  onChange?: (values: string[]) => void;
  onOpen?: () => void;
  onClose?: () => void;
  style?: CSSProperties;
  className?: string;
}

const getAllLeaves = (item: VTreeSelectItem): VTreeSelectLeaf[] => {
  if (item.type === 'leaf') return [item];
  return item.children.flatMap(getAllLeaves);
};

const getGroupState = (
  group: VTreeSelectGroup,
  value: string[],
): 'none' | 'indeterminate' | 'selected' => {
  const leaves = getAllLeaves(group);
  const selectedCount = leaves.filter((l) => value.includes(l.value)).length;
  if (selectedCount === 0) return 'none';
  if (selectedCount === leaves.length) return 'selected';
  return 'indeterminate';
};

export const VTreeSelect = ({
  label,
  items,
  value = [],
  placeholder = 'Выберите',
  emptyText = 'Не выбрано',
  selectAll = false,
  error,
  disabled,
  required,
  clearable = true,
  onChange,
  onOpen,
  onClose,
  style,
  className,
}: VTreeSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const hasError = Boolean(error);
  const hasValue = value.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const displayText = hasValue ? `Выбрано: ${value.length}` : emptyText || placeholder;

  const toggleOpen = () => {
    if (disabled) return;
    const next = !isOpen;
    setIsOpen(next);
    if (next) onOpen?.();
    else onClose?.();
  };

  const toggleCollapse = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleToggleLeaf = (leafValue: string) => {
    if (disabled) return;
    const next = value.includes(leafValue)
      ? value.filter((v) => v !== leafValue)
      : [...value, leafValue];
    onChange?.(next);
  };

  const handleToggleGroup = (group: VTreeSelectGroup) => {
    if (disabled) return;
    const leaves = getAllLeaves(group);
    const allSelected = leaves.every((l) => value.includes(l.value));
    if (allSelected) {
      onChange?.(value.filter((v) => !leaves.some((l) => l.value === v)));
    } else {
      const leafValues = leaves.map((l) => l.value);
      onChange?.([...new Set([...value, ...leafValues])]);
    }
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange?.([]);
  };

  const allLeaves = items.flatMap(getAllLeaves);
  const allSelected =
    selectAll && allLeaves.length > 0 && allLeaves.every((l) => value.includes(l.value));

  const handleToggleAll = () => {
    if (disabled) return;
    if (allSelected) {
      onChange?.([]);
    } else {
      onChange?.(allLeaves.map((l) => l.value));
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {label && <label className={styles.label}>{label}</label>}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-invalid={hasError}
        aria-haspopup="tree"
        onClick={toggleOpen}
        className={styles.trigger}
        data-has-value={hasValue ? 'true' : undefined}
        data-open={isOpen ? 'true' : undefined}
        data-invalid={hasError ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
      >
        <span className={styles.triggerText}>
          <span className={styles.triggerTextValue}>{displayText}</span>
        </span>
        <span className={styles.triggerActions}>
          {hasValue && clearable && !disabled && !required && (
            <button
              type="button"
              aria-label="Очистить"
              onClick={handleClear}
              className={styles.clearButton}
            >
              <ClearIcon size={16} color="currentColor" />
            </button>
          )}
          <span
            className={styles.chevron}
            style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
          >
            <ChevronDownIcon size={16} color="currentColor" />
          </span>
        </span>
      </div>
      {isOpen && !disabled && (
        <div role="treebox" className={styles.dropdown}>
          {selectAll && (
            <>
              <div
                role="treeitem"
                aria-selected={allSelected}
                onClick={handleToggleAll}
                className={styles.leaf}
                data-selected={allSelected ? 'true' : undefined}
              >
                <span className={styles.optionText}>Выбрать все</span>
                <span className={styles.checkmark}>
                  {allSelected && <CheckIcon size={14} color="currentColor" />}
                </span>
              </div>
              <div className={styles.separator} />
            </>
          )}
          {items.map((item, index) => (
            <TreeItem
              key={item.type === 'leaf' ? item.value : item.label}
              item={item}
              value={value}
              isCollapsed={collapsed.has(index)}
              onToggleLeaf={handleToggleLeaf}
              onToggleGroup={handleToggleGroup}
              onToggleCollapse={(e) => toggleCollapse(index, e)}
            />
          ))}
        </div>
      )}
      {hasError && <span className={styles.error}>{error}</span>}
    </div>
  );
};

interface TreeItemProps {
  item: VTreeSelectItem;
  value: string[];
  isCollapsed: boolean;
  onToggleLeaf: (value: string) => void;
  onToggleGroup: (group: VTreeSelectGroup) => void;
  onToggleCollapse: (event: React.MouseEvent) => void;
  level?: number;
}

const TreeItem = ({
  item,
  value,
  isCollapsed,
  onToggleLeaf,
  onToggleGroup,
  onToggleCollapse,
  level = 0,
}: TreeItemProps) => {
  if (item.type === 'leaf') {
    const isSelected = value.includes(item.value);
    return (
      <div
        role="treeitem"
        aria-selected={isSelected}
        onClick={() => onToggleLeaf(item.value)}
        className={styles.leaf}
        style={{ paddingLeft: `calc(var(--space-m) + ${level * 32}px)` }}
        data-selected={isSelected ? 'true' : undefined}
      >
        {item.prefix}
        <span className={styles.optionText}>{item.label}</span>
        <span className={styles.checkmark}>
          {isSelected && <CheckIcon size={14} color="currentColor" />}
        </span>
      </div>
    );
  }

  const groupState = getGroupState(item, value);
  const leaves = getAllLeaves(item);
  const selectedCount = leaves.filter((l) => value.includes(l.value)).length;

  return (
    <div className={styles.group} data-collapsed={isCollapsed ? 'true' : undefined}>
      <div
        className={styles.groupRow}
        style={{ paddingLeft: `calc(var(--space-m) + ${level * 32}px)` }}
      >
        <button
          type="button"
          className={styles.groupArrow}
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Развернуть' : 'Свернуть'}
        >
          <span
            className={styles.arrowIcon}
            style={{ transform: isCollapsed ? 'none' : 'rotate(90deg)' }}
          >
            <ChevronRightIcon size={14} color="currentColor" />
          </span>
        </button>
        <div
          role="treeitem"
          aria-selected={groupState !== 'none'}
          onClick={() => onToggleGroup(item)}
          className={styles.groupLabel}
          data-selected={groupState === 'selected' ? 'true' : undefined}
          data-indeterminate={groupState === 'indeterminate' ? 'true' : undefined}
        >
          <span className={styles.optionText}>{item.label}</span>
          <span className={styles.groupCounter}>
            {selectedCount}/{leaves.length}
          </span>
          <span className={styles.checkmark}>
            {groupState === 'selected' && <CheckIcon size={14} color="currentColor" />}
            {groupState === 'indeterminate' && <span className={styles.indeterminateMark} />}
          </span>
        </div>
      </div>
      {!isCollapsed && (
        <div className={styles.groupChildren}>
          {item.children.map((child) => (
            <TreeItem
              key={child.type === 'leaf' ? child.value : child.label}
              item={child}
              value={value}
              isCollapsed={false}
              onToggleLeaf={onToggleLeaf}
              onToggleGroup={onToggleGroup}
              onToggleCollapse={onToggleCollapse}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
