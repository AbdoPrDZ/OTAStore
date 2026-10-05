import { apiRequest } from './client';
import type { BaseResponse, StoreReview } from './types';

export interface MyReview {
  id: number;
  app_id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  status: 'published';
}

export function fetchMyReview(appId: number, token: string) {
  return apiRequest<BaseResponse & { item: MyReview | null }>(
    `/app/${appId}/review/me`,
    { token },
  );
}

export function saveReview(
  appId: number,
  data: { rating: number; title?: string; comment?: string },
  token: string,
) {
  return apiRequest<BaseResponse & { item: StoreReview }>(`/app/${appId}/review`, {
    method: 'POST',
    body: data,
    token,
  });
}
