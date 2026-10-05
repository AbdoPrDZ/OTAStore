import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import AppLogo from '@/components/AppLogo';
import TopBar from '@/components/TopBar';
import { AppCard, AppText } from '@/components/ui';
import { useConfig } from '@/context/ConfigContext';
import { radius, spacing, useTheme } from '@/theme';

const APP_VERSION = '1.0.0';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const Feature = ({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description: string;
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.feature}>
      <View style={[styles.featureIcon, { backgroundColor: colors.primarySoft }]}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.featureText}>
        <AppText variant="body" bold>
          {title}
        </AppText>
        <AppText variant="small" color="secondary">
          {description}
        </AppText>
      </View>
    </View>
  );
};

const InfoRow = ({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) => {
  const { colors } = useTheme();

  const content = (
    <>
      <AppText variant="secondary" color="secondary">
        {label}
      </AppText>
      <View style={styles.rowValue}>
        <AppText variant="secondary" numberOfLines={1} style={styles.value}>
          {value}
        </AppText>
        {onPress ? (
          <MaterialCommunityIcons
            name="open-in-new"
            size={16}
            color={colors.primary}
          />
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.row}>{content}</View>;
};

export default () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { baseUrl } = useConfig();

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TopBar title={t('about.title')} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <AppLogo name="OTAStore" size={80} />
          <AppText variant="hero" style={styles.name}>
            OTAStore
          </AppText>
          <AppText variant="secondary" color="secondary">
            {t('about.tagline')}
          </AppText>
        </View>

        <AppCard style={styles.card}>
          <AppText variant="secondary" color="secondary" style={styles.description}>
            {t('about.description')}
          </AppText>
        </AppCard>

        <AppCard style={styles.card}>
          <AppText variant="sectionTitle" style={styles.sectionTitle}>
            {t('about.featuresTitle')}
          </AppText>

          <Feature
            icon="storefront-outline"
            title={t('about.featureBrowse')}
            description={t('about.featureBrowseDesc')}
          />
          <Feature
            icon="download"
            title={t('about.featureInstall')}
            description={t('about.featureInstallDesc')}
          />
          <Feature
            icon="update"
            title={t('about.featureOta')}
            description={t('about.featureOtaDesc')}
          />
          <Feature
            icon="star-outline"
            title={t('about.featureReviews')}
            description={t('about.featureReviewsDesc')}
          />
          <Feature
            icon="translate"
            title={t('about.featureLanguages')}
            description={t('about.featureLanguagesDesc')}
          />
        </AppCard>

        <AppCard style={styles.card}>
          <AppText variant="sectionTitle" style={styles.sectionTitle}>
            {t('about.poweredTitle')}
          </AppText>

          <View style={styles.poweredRow}>
            <AppText variant="body" bold>
              OTACenter
            </AppText>
            <AppText variant="small" color="secondary">
              {t('about.poweredCenterDesc')}
            </AppText>
          </View>
          <View style={styles.poweredRow}>
            <AppText variant="body" bold>
              ota-client
            </AppText>
            <AppText variant="small" color="secondary">
              {t('about.poweredClientDesc')}
            </AppText>
          </View>
        </AppCard>

        <AppCard style={styles.card}>
          <AppText variant="sectionTitle" style={styles.sectionTitle}>
            {t('about.linksTitle')}
          </AppText>

          <InfoRow label={t('about.version')} value={APP_VERSION} />
          <InfoRow label={t('about.server')} value={baseUrl} />
          <InfoRow
            label={t('about.openServer')}
            value={baseUrl}
            onPress={() => Linking.openURL(baseUrl).catch(() => undefined)}
          />
        </AppCard>
      </ScrollView>
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
  brand: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  name: {
    marginTop: spacing.xs,
  },
  card: {
    padding: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  description: {
    lineHeight: 22,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  poweredRow: {
    gap: 2,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  value: {
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.6,
  },
});
