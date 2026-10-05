import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { DEFAULT_BASE_URL, resolveBaseUrl } from '@/api/client';

type ConfigContextValue = {
  baseUrl: string;
  ready: boolean;
};

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [baseUrl, setBaseUrl] = useState<string>(DEFAULT_BASE_URL);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    resolveBaseUrl()
      .then(url => {
        if (active) {
          setBaseUrl(url);
        }
      })
      .finally(() => {
        if (active) {
          setReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<ConfigContextValue>(
    () => ({ baseUrl, ready }),
    [baseUrl, ready],
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export const useConfig = (): ConfigContextValue => {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error('useConfig must be used inside ConfigProvider');
  }
  return ctx;
};
