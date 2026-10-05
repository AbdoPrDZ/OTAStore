import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchPrivateApps, fetchPublicApps } from '@/api/store';
import type { StoreApp } from '@/api/types';
import StoreAppRow from '@/components/StoreAppRow';
import TopBar from '@/components/TopBar';
import {
  AppButton,
  AppSearchBar,
  AppText,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { radius, spacing, useTheme } from '@/theme';
import type { MainDrawerScreenProps, StoreSource } from '@/types/navigation';

const PAGE_SIZE = 12;

type SourceFilter = 'all' | 'public' | 'private';

const FilterChip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? colors.primarySoft : colors.surface,
          borderColor: active ? colors.primary : colors.border,
          borderRadius: radius.pill,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <AppText variant="small" color={active ? 'primary' : 'secondary'} bold={active}>
        {label}
      </AppText>
    </Pressable>
  );
};

export default ({ navigation }: MainDrawerScreenProps<'Store'>) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { token } = useAuth();
  const authenticated = !!token;

  const [source, setSource] = useState<SourceFilter>('all');
  const [query, setQuery] = useState('');
  const [publicApps, setPublicApps] = useState<StoreApp[]>([]);
  const [privateApps, setPrivateApps] = useState<StoreApp[]>([]);
  const [publicPage, setPublicPage] = useState(1);
  const [publicPages, setPublicPages] = useState(1);
  const [privatePage, setPrivatePage] = useState(1);
  const [privatePages, setPrivatePages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>();

  const requestId = useRef(0);

  const loadPublic = useCallback(
    async (targetPage: number, append: boolean, id: number) => {
      const response = await fetchPublicApps({
        page: targetPage,
        pageSize: PAGE_SIZE,
        search: query || undefined,
      });

      if (id !== requestId.current) {
        return;
      }

      setPublicApps(current => (append ? [...current, ...response.items] : response.items));
      setPublicPage(response.page);
      setPublicPages(response.pagesCount);
    },
    [query],
  );

  const loadPrivate = useCallback(
    async (targetPage: number, append: boolean, id: number) => {
      if (!token) {
        return;
      }

      const response = await fetchPrivateApps(
        { page: targetPage, pageSize: PAGE_SIZE, search: query || undefined },
        token,
      );

      if (id !== requestId.current) {
        return;
      }

      setPrivateApps(current => (append ? [...current, ...response.items] : response.items));
      setPrivatePage(response.page);
      setPrivatePages(response.pagesCount);
    },
    [query, token],
  );

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    setError(undefined);
    setLoading(true);

    try {
      await loadPublic(1, false, id);

      if (token) {
        await loadPrivate(1, false, id);
      }
    } catch (caught) {
      if (id === requestId.current) {
        setError(caught instanceof Error ? caught.message : t('ui.errorDefaultMessage'));
      }
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [loadPublic, loadPrivate, token, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!authenticated && source === 'private') {
      setSource('public');
    }
  }, [authenticated, source]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore) {
      return;
    }

    const wantsPublic = source !== 'private';
    const wantsPrivate = source !== 'public' && authenticated;

    setLoadingMore(true);

    try {
      if (wantsPublic && publicPage < publicPages) {
        await loadPublic(publicPage + 1, true, ++requestId.current);
      } else if (wantsPrivate && privatePage < privatePages) {
        await loadPrivate(privatePage + 1, true, ++requestId.current);
      }
    } catch {
      // Keep what is already on screen; a pull-to-refresh can retry.
    } finally {
      setLoadingMore(false);
    }
  }, [
    loading,
    loadingMore,
    source,
    authenticated,
    publicPage,
    publicPages,
    privatePage,
    privatePages,
    loadPublic,
    loadPrivate,
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    reload();
  }, [reload]);

  const privateIds = useMemo(
    () => new Set(privateApps.map(app => app.id)),
    [privateApps],
  );

  const displayed = useMemo(() => {
    if (source === 'public') {
      return publicApps;
    }

    if (source === 'private') {
      return privateApps;
    }

    const seen = new Set<number>();
    const merged: StoreApp[] = [];

    [...privateApps, ...publicApps].forEach(app => {
      if (!seen.has(app.id)) {
        seen.add(app.id);
        merged.push(app);
      }
    });

    return merged;
  }, [source, publicApps, privateApps]);

  const hasMore = useMemo(() => {
    if (source === 'private') {
      return authenticated && privatePage < privatePages;
    }

    if (source === 'public') {
      return publicPage < publicPages;
    }

    return publicPage < publicPages || (authenticated && privatePage < privatePages);
  }, [source, authenticated, publicPage, publicPages, privatePage, privatePages]);

  const openApp = useCallback(
    (app: StoreApp) => {
      const appSource: StoreSource = privateIds.has(app.id) ? 'private' : 'public';
      navigation.navigate('AppDetail', { id: app.id, source: appSource });
    },
    [navigation, privateIds],
  );

  const filters: { key: SourceFilter; label: string; show: boolean }[] = [
    { key: 'all', label: t('store.filterAll'), show: true },
    { key: 'public', label: t('store.filterPublic'), show: true },
    { key: 'private', label: t('store.filterPrivate'), show: authenticated },
  ];

  const listHeader = useMemo(
    () => (
      <View style={styles.headerArea}>
        <AppSearchBar
          value={query}
          onDebounced={setQuery}
          placeholder={t('store.searchPlaceholder')}
          returnKeyType="search"
        />
        <View style={styles.chips}>
          {filters
            .filter(item => item.show)
            .map(item => (
              <FilterChip
                key={item.key}
                label={item.label}
                active={source === item.key}
                onPress={() => setSource(item.key)}
              />
            ))}
        </View>
      </View>
    ),
    // `filters` derives from `source`, `authenticated` and `t`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, source, authenticated, t],
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TopBar title={t('store.title')} />

      <FlatList
        data={displayed}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <StoreAppRow app={item} onPress={() => openApp(item)} />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : (
            <EmptyState
              icon="package-variant-closed"
              title={t('store.noAppsTitle')}
              description={
                query ? t('store.noSearchResults') : t('store.noAppsDescription')
              }
            />
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={colors.primary} style={styles.footer} />
          ) : hasMore ? (
            <AppButton
              variant="ghost"
              title={t('store.loadMore')}
              onPress={loadMore}
              style={styles.footer}
            />
          ) : undefined
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerArea: {
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  footer: {
    marginTop: spacing.md,
  },
});
