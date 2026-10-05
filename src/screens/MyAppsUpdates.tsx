import React, { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchPrivateApps, fetchPublicApps } from '@/api/store';
import type { StoreApp } from '@/api/types';
import InstallPermissionModal from '@/components/InstallPermissionModal';
import StoreAppRow from '@/components/StoreAppRow';
import TopBar from '@/components/TopBar';
import { AppButton, AppText, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useInstallFlow } from '@/hooks/useInstallFlow';
import { spacing, useTheme } from '@/theme';
import type { MainDrawerScreenProps, StoreSource } from '@/types/navigation';
import {
  getInstalledVersions,
  openApp,
  type InstalledInfo,
} from '@/utils/installer';
import { compareVersions } from '@/utils/version';

export default ({ navigation }: MainDrawerScreenProps<'MyAppsUpdates'>) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { token } = useAuth();
  const { install, installingPackage, permissionOpen, setPermissionOpen } =
    useInstallFlow();

  const [apps, setApps] = useState<StoreApp[]>([]);
  const [installedMap, setInstalledMap] = useState<
    Record<string, InstalledInfo | null>
  >({});
  const [privateIds, setPrivateIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setError(undefined);

    try {
      const publicResponse = await fetchPublicApps({ page: 1, pageSize: 100 });
      let privateItems: StoreApp[] = [];

      if (token) {
        const privateResponse = await fetchPrivateApps(
          { page: 1, pageSize: 100 },
          token,
        );
        privateItems = privateResponse.items;
      }

      const seen = new Set<number>();
      const merged: StoreApp[] = [];

      [...privateItems, ...publicResponse.items].forEach(app => {
        if (!seen.has(app.id)) {
          seen.add(app.id);
          merged.push(app);
        }
      });

      const installed = await getInstalledVersions(
        Array.from(new Set(merged.map(app => app.package_name))),
      );

      setApps(merged);
      setPrivateIds(new Set(privateItems.map(app => app.id)));
      setInstalledMap(installed);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('ui.errorDefaultMessage'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const installedApps = useMemo(
    () => apps.filter(app => installedMap[app.package_name]),
    [apps, installedMap],
  );

  const updateIds = useMemo(() => {
    const ids = new Set<number>();

    installedApps.forEach(app => {
      const installedVersion = installedMap[app.package_name]?.versionName ?? null;

      if (compareVersions(installedVersion, app.version) < 0) {
        ids.add(app.id);
      }
    });

    return ids;
  }, [installedApps, installedMap]);

  const updates = useMemo(
    () => installedApps.filter(app => updateIds.has(app.id)),
    [installedApps, updateIds],
  );

  const upToDate = useMemo(
    () => installedApps.filter(app => !updateIds.has(app.id)),
    [installedApps, updateIds],
  );

  const sourceOf = useCallback(
    (app: StoreApp): StoreSource => (privateIds.has(app.id) ? 'private' : 'public'),
    [privateIds],
  );

  const openDetail = useCallback(
    (app: StoreApp) =>
      navigation.navigate('AppDetail', { id: app.id, source: sourceOf(app) }),
    [navigation, sourceOf],
  );

  const sections = useMemo(() => {
    const result: { key: string; title: string; data: StoreApp[] }[] = [];

    if (updates.length > 0) {
      result.push({ key: 'updates', title: t('updates.available'), data: updates });
    }

    if (upToDate.length > 0) {
      result.push({ key: 'uptodate', title: t('updates.upToDate'), data: upToDate });
    }

    return result;
  }, [updates, upToDate, t]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TopBar title={t('updates.title')} />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : installedApps.length === 0 ? (
        <EmptyState
          icon="cellphone-arrow-down"
          title={t('updates.empty')}
          description={t('updates.emptyDescription')}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderSectionHeader={({ section }) => (
            <AppText variant="sectionTitle" style={styles.sectionHeader}>
              {section.title}
            </AppText>
          )}
          renderItem={({ item }) => {
            const isUpdate = updateIds.has(item.id);

            return (
              <StoreAppRow
                app={item}
                onPress={() => openDetail(item)}
                chevron={false}
                action={
                  <AppButton
                    size="sm"
                    variant={isUpdate ? 'primary' : 'outline'}
                    title={isUpdate ? t('updates.update') : t('updates.open')}
                    loading={installingPackage === item.package_name}
                    onPress={() =>
                      isUpdate
                        ? install(item, sourceOf(item))
                        : openApp(item.package_name)
                    }
                  />
                }
              />
            );
          }}
          ListFooterComponent={<View style={styles.footer} />}
        />
      )}

      <InstallPermissionModal
        visible={permissionOpen}
        onClose={() => setPermissionOpen(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  footer: {
    height: spacing.xl,
  },
});
