import { useCallback, useState } from 'react';

import type { StoreApp } from '@/api/types';
import { useAuth } from '@/context/AuthContext';
import type { StoreSource } from '@/types/navigation';
import { installApp } from '@/utils/installer';

/**
 * Runs the download-and-install flow for a store app and surfaces the case
 * where Android needs the "install unknown apps" capability first.
 */
export function useInstallFlow() {
  const { token } = useAuth();
  const [installingPackage, setInstallingPackage] = useState<string | null>(null);
  const [permissionOpen, setPermissionOpen] = useState(false);

  const install = useCallback(
    async (app: StoreApp, source: StoreSource) => {
      if (!app.download_url) {
        return;
      }

      setInstallingPackage(app.package_name);

      try {
        const outcome = await installApp({
          url: app.download_url,
          fileName: `${app.package_name}-${app.version ?? 'latest'}.apk`,
          token: source === 'private' ? token : null,
        });

        if (outcome === 'permission') {
          setPermissionOpen(true);
        }
      } finally {
        setInstallingPackage(null);
      }
    },
    [token],
  );

  return { install, installingPackage, permissionOpen, setPermissionOpen };
}
