import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchPrivateApp, fetchPublicApp } from '@/api/store';
import { fetchMyReview } from '@/api/review';
import type { StoreAppDetail } from '@/api/types';
import AppLogo from '@/components/AppLogo';
import InstallPermissionModal from '@/components/InstallPermissionModal';
import ReviewItem from '@/components/ReviewItem';
import StarRating from '@/components/StarRating';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppHeader,
  AppText,
  ErrorState,
  LoadingState,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useInstallFlow } from '@/hooks/useInstallFlow';
import { useInstallState } from '@/hooks/useInstallState';
import { spacing, useTheme } from '@/theme';
import type { RootStackScreenProps } from '@/types/navigation';
import { formatBytes, formatDate } from '@/utils/format';
import { openApp } from '@/utils/installer';

export default ({ navigation, route }: RootStackScreenProps<'AppDetail'>) => {
  const { id, source } = route.params;
  const { t } = useTranslation();
  const { colors, radius } = useTheme();
  const { token, isAuthenticated } = useAuth();

  const [app, setApp] = useState<StoreAppDetail>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [myRating, setMyRating] = useState<number | null>(null);

  const { install, installingPackage, permissionOpen, setPermissionOpen } =
    useInstallFlow();
  const { status, installedVersion } = useInstallState(
    app?.package_name,
    app?.version,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const response =
        source === 'public'
          ? await fetchPublicApp(id)
          : await fetchPrivateApp(id, token as string);

      setApp(response.item);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('ui.errorDefaultMessage'));
    } finally {
      setLoading(false);
    }
  }, [id, source, token, t]);

  useEffect(() => {
    load();
  }, [load]);

  // The signed-in user's own review status for this app (null = not reviewed).
  useEffect(() => {
    if (!token) {
      setMyRating(null);
      return;
    }

    let active = true;

    fetchMyReview(id, token)
      .then(response => {
        if (active) {
          setMyRating(response.item ? response.item.rating : null);
        }
      })
      .catch(() => {
        if (active) {
          setMyRating(null);
        }
      });

    return () => {
      active = false;
    };
  }, [id, token]);

  const latest = app?.versions[0];
  const latestSize = formatBytes(latest?.size);

  const installLabel =
    status === 'update' ? t('detail.update') : t('store.install');

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <AppHeader
        title={app?.name ?? t('detail.notFound')}
        subtitle={app?.package_name}
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <LoadingState />
      ) : error || !app ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <AppCard style={styles.hero}>
            <View style={styles.heroTop}>
              <AppLogo name={app.name} logoUrl={app.logo_url} size={64} />
              <View style={styles.heroText}>
                <AppText variant="sectionTitle" numberOfLines={2}>
                  {app.name}
                </AppText>
                {app.summary ? (
                  <AppText variant="secondary" color="secondary" numberOfLines={3}>
                    {app.summary}
                  </AppText>
                ) : null}
              </View>
            </View>

            <View style={styles.badges}>
              {app.version ? <AppBadge label={app.version} variant="primary" /> : null}
              {app.domains.map(domain => (
                <AppBadge key={domain.id} label={domain.name} />
              ))}
            </View>

            {app.rating_count > 0 && app.rating_avg != null ? (
              <View style={styles.ratingSummary}>
                <StarRating value={app.rating_avg} size={16} />
                <AppText variant="small" color="secondary">
                  {app.rating_avg.toFixed(1)} ·{' '}
                  {t('review.reviews', { count: app.rating_count })}
                </AppText>
              </View>
            ) : null}

            {status === 'open' ? (
              <AppButton
                title={t('detail.open')}
                icon="open-in-new"
                onPress={() => openApp(app.package_name)}
                style={styles.install}
              />
            ) : (
              <AppButton
                title={installLabel}
                icon="download"
                loading={installingPackage === app.package_name}
                onPress={() => install(app, source)}
                style={styles.install}
              />
            )}

            <View style={styles.meta}>
              {installedVersion ? (
                <AppText variant="small" color="success">
                  {t('detail.installedVersion')} {installedVersion}
                </AppText>
              ) : null}
              {latest ? (
                <AppText variant="small" color="secondary">
                  {t('detail.latestVersion')} {latest.name}
                </AppText>
              ) : null}
              {latestSize ? (
                <AppText variant="small" color="secondary">
                  {t('store.size')} {latestSize}
                </AppText>
              ) : null}
              {formatDate(latest?.created_at) ? (
                <AppText variant="small" color="secondary">
                  {t('store.updated')} {formatDate(latest?.created_at)}
                </AppText>
              ) : null}
            </View>
          </AppCard>

          <AppCard style={styles.card}>
            <AppText variant="sectionTitle" style={styles.sectionTitle}>
              {t('detail.screenshots')}
            </AppText>

            {app.screenshots.length === 0 ? (
              <AppText variant="secondary" color="secondary">
                {t('detail.noScreenshots')}
              </AppText>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.screenshots}
              >
                {app.screenshots.map(src => (
                  <Image
                    key={src}
                    source={{ uri: src }}
                    style={[
                      styles.screenshot,
                      { borderColor: colors.border, borderRadius: radius.card },
                    ]}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}
          </AppCard>

          {app.description ? (
            <AppCard style={styles.card}>
              <AppText variant="sectionTitle" style={styles.sectionTitle}>
                {t('detail.about')}
              </AppText>
              <AppText variant="secondary" color="secondary" style={styles.description}>
                {app.description}
              </AppText>
            </AppCard>
          ) : null}

          <AppCard style={styles.card}>
            <View style={styles.reviewHeader}>
              <AppText variant="sectionTitle">{t('review.title')}</AppText>
              <AppButton
                size="sm"
                variant="ghost"
                title={app.rating_count > 0 ? t('review.seeAll') : t('review.write')}
                onPress={() =>
                  navigation.navigate('AppReviews', {
                    id,
                    source,
                    name: app.name,
                    ratingAvg: app.rating_avg,
                    ratingCount: app.rating_count,
                  })
                }
              />
            </View>

            {isAuthenticated ? (
              <View style={[styles.reviewStatus, { borderColor: colors.border }]}>
                <AppText variant="small" color="secondary">
                  {t('review.yourStatus')}
                </AppText>
                {myRating != null ? (
                  <View style={styles.reviewStatusValue}>
                    <StarRating value={myRating} size={14} />
                    <AppText variant="small" color="success" bold>
                      {t('review.reviewed')}
                    </AppText>
                  </View>
                ) : (
                  <AppText variant="small" color="secondary">
                    {t('review.notReviewed')}
                  </AppText>
                )}
              </View>
            ) : null}

            {app.reviews.length === 0 ? (
              <AppText
                variant="secondary"
                color="secondary"
                style={styles.reviewEmpty}
              >
                {t('review.empty')}
              </AppText>
            ) : (
              app.reviews
                .slice(0, 3)
                .map(item => <ReviewItem key={item.id} review={item} />)
            )}
          </AppCard>

          <AppCard style={styles.card}>
            <AppText variant="sectionTitle" style={styles.sectionTitle}>
              {t('detail.versions')}
            </AppText>

            {app.versions.map(version => (
              <View
                key={version.id}
                style={[styles.versionRow, { borderColor: colors.border }]}
              >
                <View style={styles.versionHeader}>
                  <AppText variant="body" bold>
                    {version.name}
                  </AppText>
                  <View style={styles.versionMeta}>
                    {formatBytes(version.size) ? (
                      <AppText variant="small" color="secondary">
                        {formatBytes(version.size)}
                      </AppText>
                    ) : null}
                    {formatDate(version.created_at) ? (
                      <AppText variant="small" color="secondary">
                        {formatDate(version.created_at)}
                      </AppText>
                    ) : null}
                  </View>
                </View>
                {version.changelog ? (
                  <AppText variant="secondary" color="secondary" style={styles.changelog}>
                    {version.changelog}
                  </AppText>
                ) : null}
              </View>
            ))}
          </AppCard>
        </ScrollView>
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  hero: {
    padding: spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroText: {
    flex: 1,
    gap: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  install: {
    marginTop: spacing.lg,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  card: {
    padding: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  screenshots: {
    gap: spacing.md,
  },
  screenshot: {
    width: 168,
    height: 298,
    borderWidth: 1,
  },
  description: {
    lineHeight: 22,
  },
  versionRow: {
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  versionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  versionMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  changelog: {
    marginTop: spacing.xs,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  reviewStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  reviewStatusValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewEmpty: {
    marginTop: spacing.sm,
  },
});
