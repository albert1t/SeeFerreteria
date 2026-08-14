import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemeChoice = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'see_theme';

function getStoredChoice(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch { /* ignore */ }
  return 'system';
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

interface ThemeContextValue {
  choice: ThemeChoice;
  resolved: ResolvedTheme;
  setChoice: (c: ThemeChoice) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<ThemeChoice>(getStoredChoice);

  useEffect(() => {
    const apply = () => {
      const next = choice === 'system' ? getSystemTheme() : choice;
      document.documentElement.setAttribute('data-theme', next);
    };
    apply();
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch { /* ignore */ }

    if (choice === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      const handler = () => apply();
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    return undefined;
  }, [choice]);

  const resolved: ResolvedTheme =
    choice === 'system' ? getSystemTheme() : choice;

  const value = useMemo(
    () => ({ choice, resolved, setChoice }),
    [choice, resolved],
  );

  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}