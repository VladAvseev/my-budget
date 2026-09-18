import {
  CapitalFilledIcon,
  CapitalIcon,
  HomeFilledIcon,
  HomeIcon,
  OverviewIcon,
  ReportsFilledIcon,
  ReportsIcon,
  type IconProps,
} from '@/shared/icons';
import type { ComponentType } from 'react';

// Пункт основной навигации приложения.
export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<IconProps>;

  activeIcon?: ComponentType<IconProps>;
  end?: boolean;
}

// Пункты основной навигации (рисуются и в верхней, и в нижней панели).
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Главная', icon: HomeIcon, activeIcon: HomeFilledIcon, end: true },
  { to: '/reports', label: 'Периоды', icon: ReportsIcon, activeIcon: ReportsFilledIcon },
  { to: '/capital', label: 'Капитал', icon: CapitalIcon, activeIcon: CapitalFilledIcon },

  { to: '/overview', label: 'Аналитика', icon: OverviewIcon },
];
