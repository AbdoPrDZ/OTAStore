import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMyReview, saveReview } from '@/api/review';
import { fetchPrivateAppReviews, fetchPublicAppReviews } from '@/api/store';
import type { StoreReview } from '@/api/types';
import ReviewItem from '@/components/ReviewItem';
import StarPicker from '@/components/StarPicker';
import StarRating from '@/components/StarRating';
import {
  AppButton,
  AppHeader,
  AppInput,
  AppText,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { spacing, useTheme } from '@/theme';
import type { RootStackScreenProps } from '@/types/navigation';

const PAGE_SIZE = 20;

export default ({ navigation, route }: RootStackScreenProps<'AppReviews'>) => {
  const { id, source, name: appName, ratingAvg, ratingCount } = route.params;
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { token, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [page, setPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>();

  const [myReview, setMyReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string>();
  const [reviewSaved, setReviewSaved] = useState(false);

  const requestId = useRef(0);

  const load = useCallback(
    async (targetPage: number, append: boolean) => {
      const rid = ++requestId.current;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(undefined);

      try {
        const response =
          source === 'public'
            ? await fetchPublicAppReviews(id, {
                page: targetPage,
                pageSize: PAGE_SIZE,
              })
            : await fetchPrivateAppReviews(id, token as string, {
                page: targetPage,
                pageSize: PAGE_SIZE,
              });

        if (rid !== requestId.current) {
          return;
        }

        setReviews(current => (append ? [...current, ...response.items] : response.items));
        setPage(response.page);
        setPagesCount(response.pagesCount);
      } catch (caught) {
        if (rid === requestId.current) {
          setError(caught instanceof Error ? caught.message : t('ui.errorDefaultMessage'));
        }
      } finally {
        if (rid === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [id, source, token, t],
  );

  useEffect(() => {
    load(1, false);
  }, [load]);

  const loadMyReview = useCallback(async () => {
    if (!token) {
      setMyReview(false);
      return;
    }

    try {
      const response = await fetchMyReview(id, token);
      const item = response.item;

      if (item) {
        setMyReview(true);
        setRating(item.rating);
        setReviewTitle(item.title ?? '');
        setReviewComment(item.comment ?? '');
      }
    } catch {
      // The form simply starts empty.
    }
  }, [id, token]);

  useEffect(() => {
    loadMyReview();
  }, [loadMyReview]);

  const submitReview = async () => {
    if (!token || rating < 1) {
      setReviewError(t('review.validationError'));
      return;
    }

    setSavingReview(true);
    setReviewError(undefined);
    setReviewSaved(false);

    try {
      await saveReview(
        id,
        {
          rating,
          title: reviewTitle.trim() || undefined,
          comment: reviewComment.trim() || undefined,
        },
        token,
      );

      setReviewSaved(true);
      await Promise.all([load(1, false), loadMyReview()]);
    } catch (caught) {
      setReviewError(
        caught instanceof Error ? caught.message : t('ui.errorDefaultMessage'),
      );
    } finally {
      setSavingReview(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(1, false);
  }, [load]);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && page < pagesCount) {
      load(page + 1, true);
    }
  }, [loading, loadingMore, page, pagesCount, load]);

  const header = (
    <View>
      {isAuthenticated ? (
        <View style={styles.form}>
          <AppText variant="sectionTitle">
            {myReview ? t('review.yourReview') : t('review.write')}
          </AppText>

          <StarPicker
            value={rating}
            onChange={value => {
              setRating(value);
              setReviewSaved(false);
            }}
            disabled={savingReview}
          />

          <AppInput
            placeholder={t('review.titlePlaceholder')}
            value={reviewTitle}
            onChangeText={setReviewTitle}
            editable={!savingReview}
          />

          <AppInput
            placeholder={t('review.commentPlaceholder')}
            value={reviewComment}
            onChangeText={setReviewComment}
            editable={!savingReview}
            multiline
            numberOfLines={3}
            style={styles.commentInput}
          />

          {reviewError ? (
            <AppText variant="secondary" color="error" style={styles.message}>
              {reviewError}
            </AppText>
          ) : null}
          {reviewSaved ? (
            <AppText variant="secondary" color="success" style={styles.message}>
              {t('review.saved')}
            </AppText>
          ) : null}

          <AppButton
            title={myReview ? t('review.update') : t('review.submit')}
            loading={savingReview}
            onPress={submitReview}
          />
        </View>
      ) : (
        <View style={styles.signInRow}>
          <AppText variant="secondary" color="secondary" style={styles.signInText}>
            {t('review.signInPrompt')}
          </AppText>
          <AppButton
            size="sm"
            variant="outline"
            title={t('auth.signIn')}
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      )}

      {ratingCount > 0 && ratingAvg != null ? (
        <View style={styles.summary}>
          <AppText variant="hero">{ratingAvg.toFixed(1)}</AppText>
          <View style={styles.summaryRight}>
            <StarRating value={ratingAvg} size={16} />
            <AppText variant="small" color="secondary">
              {t('review.reviews', { count: ratingCount })}
            </AppText>
          </View>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <AppHeader
        title={t('review.title')}
        subtitle={appName}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={reviews}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        renderItem={({ item }) => <ReviewItem review={item} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
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
            <ErrorState message={error} onRetry={() => load(1, false)} />
          ) : (
            <EmptyState icon="star-outline" title={t('review.empty')} />
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={colors.primary} style={styles.footer} />
          ) : page < pagesCount ? (
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  form: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  commentInput: {
    marginBottom: 0,
  },
  message: {
    marginTop: spacing.xs,
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  signInText: {
    flex: 1,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  summaryRight: {
    gap: spacing.xs,
  },
  footer: {
    marginTop: spacing.md,
  },
});
