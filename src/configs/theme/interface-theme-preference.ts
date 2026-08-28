import { useSyncExternalStore } from 'react';

import {
  parseInterfaceTheme,
  type InterfaceTheme,
} from './semantic-surfaces';

const STORAGE_KEY = 'sst:interface-theme-override';

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function isInterfaceTheme(value: string | null): value is InterfaceTheme {
  return value === 'light' || value === 'dark';
}

export function getInterfaceThemeOverride(): InterfaceTheme | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isInterfaceTheme(stored) ? stored : null;
}

export function setInterfaceThemeOverride(mode: InterfaceTheme) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, mode);
  notify();
}

export function subscribeInterfaceThemeOverride(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStoreChange);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStoreChange);
    }
  };
}

export function useInterfaceThemeOverride() {
  return useSyncExternalStore(
    subscribeInterfaceThemeOverride,
    getInterfaceThemeOverride,
    () => null,
  );
}

export function resolveInterfaceTheme(
  companyTheme: unknown,
  override: InterfaceTheme | null,
): InterfaceTheme {
  return override ?? parseInterfaceTheme(companyTheme);
}
