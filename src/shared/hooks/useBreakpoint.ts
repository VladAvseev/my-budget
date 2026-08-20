import { useSyncExternalStore } from 'react';
import { breakpoints } from './breakpoints';

export interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const MOBILE_QUERY = `(max-width: ${breakpoints.md - 1}px)`;
const DESKTOP_QUERY = `(min-width: ${breakpoints.lg}px)`;

function subscribeMobile(callback: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_QUERY);
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function subscribeDesktop(callback: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_QUERY);
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getSnapshotMobile(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getSnapshotDesktop(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useBreakpoint(): BreakpointState {
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getSnapshotMobile,
    getServerSnapshot,
  );
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    getSnapshotDesktop,
    getServerSnapshot,
  );

  return {
    isMobile,
    isTablet: !isMobile && !isDesktop,
    isDesktop,
  };
}