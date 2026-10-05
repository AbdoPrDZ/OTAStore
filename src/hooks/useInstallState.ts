import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getInstalledVersion } from '@/utils/installer';
import { compareVersions } from '@/utils/version';

export type InstallStatus = 'install' | 'update' | 'open';

export type InstallState = {
  status: InstallStatus;
  installedVersion: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

/**
 * Whether an app is installed, and whether the store has something newer.
 *
 * Re-checks when the screen regains focus and when the app returns to the
 * foreground, so the action flips from Install to Open/Update as soon as the
 * user comes back from the system installer.
 */
export function useInstallState(
  packageName?: string | null,
  latestVersion?: string | null,
): InstallState {
  const [installedVersion, setInstalledVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!packageName) {
      setInstalledVersion(null);
      setLoading(false);
      return;
    }

    try {
      const info = await getInstalledVersion(packageName);

      if (mounted.current) {
        setInstalledVersion(info?.versionName ?? null);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [packageName]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refresh();
      }
    });

    return () => subscription.remove();
  }, [refresh]);

  const status: InstallStatus =
    installedVersion == null
      ? 'install'
      : latestVersion && compareVersions(installedVersion, latestVersion) < 0
      ? 'update'
      : 'open';

  return { status, installedVersion, loading, refresh };
}
