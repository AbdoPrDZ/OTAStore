import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { ThemeMode } from '@/theme';

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({
  initialMode,
  onChangeMode,
  children,
}: {
  initialMode: ThemeMode;
  onChangeMode?: (mode: ThemeMode) => void;
  children: ReactNode;
}) => {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);

  useEffect(() => {
    setModeState(initialMode);
  }, [initialMode]);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      onChangeMode?.(next);
    },
    [onChangeMode],
  );

  const value = useMemo<ThemeContextValue>(() => ({ mode, setMode }), [mode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeMode = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used inside ThemeProvider');
  }
  return ctx;
};
