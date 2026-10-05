import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { StoreReview } from '@/api/types';
import { spacing, useTheme } from '@/theme';

import AppLogo from './AppLogo';
import StarRating from './StarRating';
import { AppText } from './ui';

export default ({ review }: { review: StoreReview }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.item, { borderColor: colors.border }]}>
      <AppLogo
        name={review.user?.name ?? '?'}
        logoUrl={review.user?.image_url}
        size={32}
        circular
      />
      <View style={styles.body}>
        <View style={styles.top}>
          <AppText variant="small" bold numberOfLines={1} style={styles.name}>
            {review.user?.name ?? t('review.anonymous')}
          </AppText>
          <StarRating value={review.rating} size={12} />
        </View>
        {review.title ? (
          <AppText variant="body" bold numberOfLines={2} style={styles.title}>
            {review.title}
          </AppText>
        ) : null}
        {review.comment ? (
          <AppText variant="secondary" color="secondary" style={styles.comment}>
            {review.comment}
          </AppText>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
  },
  title: {
    marginTop: 2,
  },
  comment: {
    marginTop: 2,
    lineHeight: 20,
  },
});
