import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchMe, login as loginRequest, logout as logoutRequest, updateProfile as updateProfileRequest } from '@/api/auth';
import type { AuthUser } from '@/api/types';
import AppStorage from '@/utils/storage';

interface Result {
  ok: boolean;
  error?: string;
}

export type ProfileValues = {
  name?: string;
  imageUri?: string;
  imageType?: string;
  imageName?: string;
};

type AuthContextValue = {
  user?: AuthUser;
  token: string | null;
  isAuthenticated: boolean;
  isTestMode: boolean;
  restoring: boolean;
  signIn: (login: string, password: string, testMode: boolean) => Promise<Result>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<Result>;
  updateProfile: (values: ProfileValues) => Promise<Result>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([AppStorage.getAuthToken(), AppStorage.getIsTestMode()])
      .then(async ([storedToken, test]) => {
        if (!active) {
          return;
        }

        setIsTestMode(test);

        if (!storedToken) {
          return;
        }

        try {
          const response = await fetchMe(storedToken);

          if (!active) {
            return;
          }

          setToken(storedToken);
          setUser(response.user);
          setIsAuthenticated(true);
        } catch {
          await AppStorage.clearAuthToken();
        }
      })
      .finally(() => {
        if (active) {
          setRestoring(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(
    async (login: string, password: string, testMode: boolean): Promise<Result> => {
      try {
        const response = await loginRequest(login, password, true);
        const nextToken = response.token;

        if (!nextToken) {
          return { ok: false, error: 'No token received from the server.' };
        }

        const me = await fetchMe(nextToken);

        await AppStorage.setAuthToken(nextToken);
        await AppStorage.setIsTestMode(testMode);

        setToken(nextToken);
        setUser(me.user);
        setIsAuthenticated(true);
        setIsTestMode(testMode);

        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'Sign-in failed.',
        };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    const current = await AppStorage.getAuthToken();

    if (current) {
      try {
        await logoutRequest(current);
      } catch {
        // Logging out locally is enough even if the server call fails.
      }
    }

    await AppStorage.clearAuthToken();
    await AppStorage.clearIsTestMode();

    setToken(null);
    setUser(undefined);
    setIsAuthenticated(false);
    setIsTestMode(false);
  }, []);

  const refreshUser = useCallback(async (): Promise<Result> => {
    if (!token) {
      return { ok: false, error: 'Not signed in.' };
    }

    try {
      const response = await fetchMe(token);
      setUser(response.user);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Could not load profile.',
      };
    }
  }, [token]);

  const updateProfile = useCallback(
    async (values: ProfileValues): Promise<Result> => {
      if (!token) {
        return { ok: false, error: 'Not signed in.' };
      }

      try {
        const formData = new FormData();
        // PHP only parses multipart bodies on POST, so spoof PUT.
        formData.append('_method', 'PUT');

        if (values.name !== undefined) {
          formData.append('name', values.name);
        }

        if (values.imageUri) {
          formData.append('image', {
            uri: values.imageUri,
            type: values.imageType ?? 'image/jpeg',
            name: values.imageName ?? 'avatar.jpg',
          } as unknown as Blob);
        }

        const response = await updateProfileRequest(token, formData);
        setUser(response.user);
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error ? error.message : 'Could not update profile.',
        };
      }
    },
    [token],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated,
      isTestMode,
      restoring,
      signIn,
      signOut,
      refreshUser,
      updateProfile,
    }),
    [
      user,
      token,
      isAuthenticated,
      isTestMode,
      restoring,
      signIn,
      signOut,
      refreshUser,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
