import { Linking, NativeModules, Platform } from 'react-native';

export type InstalledInfo = {
  versionName: string | null;
  versionCode: number;
};

type ApkInstallerNative = {
  isInstallPermissionGranted(): Promise<boolean>;
  openInstallSettings(): Promise<boolean>;
  downloadAndInstall(
    url: string,
    fileName: string,
    headers: Record<string, string> | null,
  ): Promise<boolean>;
  getInstalledVersion(packageName: string): Promise<InstalledInfo | null>;
  getInstalledVersions(
    packages: string[],
  ): Promise<Record<string, InstalledInfo | null>>;
  openApp(packageName: string): Promise<boolean>;
};

const ApkInstaller = NativeModules.ApkInstaller as ApkInstallerNative | undefined;

export type InstallOutcome = 'native' | 'browser' | 'permission';

export function isNativeInstallerAvailable(): boolean {
  return Platform.OS === 'android' && !!ApkInstaller;
}

export async function isInstallPermissionGranted(): Promise<boolean> {
  if (!isNativeInstallerAvailable()) {
    return false;
  }

  try {
    return await ApkInstaller!.isInstallPermissionGranted();
  } catch {
    return false;
  }
}

export async function openInstallSettings(): Promise<void> {
  if (!isNativeInstallerAvailable()) {
    return;
  }

  try {
    await ApkInstaller!.openInstallSettings();
  } catch {
    // The user can still enable the permission manually from system settings.
  }
}

function withToken(url: string, token?: string | null): string {
  if (!token) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

export function openExternal(url: string, token?: string | null): Promise<unknown> {
  return Linking.openURL(withToken(url, token));
}

/**
 * Downloads an `.apk` through the native module (which forwards the bearer
 * header) and launches the system installer. Falls back to the browser when the
 * module is unavailable or the download fails.
 *
 * Returns `'permission'` when Android's install-unknown-apps capability is off,
 * so the caller can prompt the user before retrying.
 */
export async function installApp(params: {
  url: string;
  fileName?: string;
  token?: string | null;
  headers?: Record<string, string>;
}): Promise<InstallOutcome> {
  const { url, fileName = 'app.apk', token, headers } = params;
  const resolvedHeaders =
    headers ?? (token ? { Authorization: `Bearer ${token}` } : null);

  if (isNativeInstallerAvailable()) {
    const granted = await isInstallPermissionGranted();

    if (!granted) {
      return 'permission';
    }

    try {
      await ApkInstaller!.downloadAndInstall(url, fileName, resolvedHeaders);
      return 'native';
    } catch (error) {
      const code = (error as { code?: string } | undefined)?.code;

      if (code === 'E_INSTALL_PERMISSION') {
        return 'permission';
      }
      // Any other failure (network, storage): fall back to the browser.
    }
  }

  await openExternal(url, token);
  return 'browser';
}

/** Installed version of a package, or null when it is not installed. */
export async function getInstalledVersion(
  packageName: string,
): Promise<InstalledInfo | null> {
  if (!isNativeInstallerAvailable()) {
    return null;
  }

  try {
    return await ApkInstaller!.getInstalledVersion(packageName);
  } catch {
    return null;
  }
}

/** Installed versions for many packages at once, keyed by package name. */
export async function getInstalledVersions(
  packages: string[],
): Promise<Record<string, InstalledInfo | null>> {
  if (packages.length === 0) {
    return {};
  }

  if (!isNativeInstallerAvailable()) {
    return Object.fromEntries(packages.map(name => [name, null]));
  }

  try {
    return await ApkInstaller!.getInstalledVersions(packages);
  } catch {
    return Object.fromEntries(packages.map(name => [name, null]));
  }
}

/** Opens an installed app. Returns false when it has no launcher activity. */
export async function openApp(packageName: string): Promise<boolean> {
  if (!isNativeInstallerAvailable()) {
    return false;
  }

  try {
    return await ApkInstaller!.openApp(packageName);
  } catch {
    return false;
  }
}

