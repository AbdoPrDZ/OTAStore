import { apiRequest, type QueryValue } from './client';
import type {
  BaseResponse,
  Paginated,
  StoreApp,
  StoreAppDetail,
  StoreDomain,
  StoreReview,
} from './types';

export interface StoreQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  domain?: number;
}

function toQuery(query: StoreQuery): Record<string, QueryValue> {
  return {
    page: query.page,
    pageSize: query.pageSize,
    search: query.search,
    domain: query.domain,
  };
}

/* ------------------------------- Public ------------------------------- */

export function fetchPublicDomains() {
  return apiRequest<BaseResponse & { items: StoreDomain[] }>('/public/domains');
}

export function fetchPublicApps(query: StoreQuery = {}) {
  return apiRequest<BaseResponse & Paginated<StoreApp>>('/public/apps', {
    query: toQuery(query),
  });
}

export function fetchPublicApp(id: number) {
  return apiRequest<BaseResponse & { item: StoreAppDetail }>(`/public/apps/${id}`);
}

export function fetchPublicAppReviews(
  id: number,
  query: { page?: number; pageSize?: number } = {},
) {
  return apiRequest<BaseResponse & Paginated<StoreReview>>(
    `/public/apps/${id}/reviews`,
    { query: { page: query.page, pageSize: query.pageSize } },
  );
}

/* ------------------------------ Private ------------------------------- */

export function fetchPrivateApps(query: StoreQuery, token: string) {
  return apiRequest<BaseResponse & Paginated<StoreApp>>('/store/apps', {
    query: toQuery(query),
    token,
  });
}

export function fetchPrivateApp(id: number, token: string) {
  return apiRequest<BaseResponse & { item: StoreAppDetail }>(`/store/apps/${id}`, {
    token,
  });
}

export function fetchPrivateAppReviews(
  id: number,
  token: string,
  query: { page?: number; pageSize?: number } = {},
) {
  return apiRequest<BaseResponse & Paginated<StoreReview>>(
    `/store/apps/${id}/reviews`,
    { query: { page: query.page, pageSize: query.pageSize }, token },
  );
}
