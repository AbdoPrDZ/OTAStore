export interface StoreDomain {
  id: number;
  name: string;
  apps_count?: number;
}

export interface StoreApp {
  id: number;
  name: string;
  package_name: string;
  summary: string | null;
  logo_url: string | null;
  domains: { id: number; name: string }[];
  version: string | null;
  update_type?: 'optional' | 'force' | null;
  updated_at: string | null;
  rating_avg: number | null;
  rating_count: number;
  download_url?: string;
}

export interface StoreReview {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  user: { name: string; image_url: string | null } | null;
  created_at: string | null;
}

export interface StoreVersion {
  id: number;
  name: string;
  changelog: string | null;
  size: number | null;
  created_at: string | null;
}

export interface StoreAppDetail extends StoreApp {
  description: string | null;
  screenshots: string[];
  versions: StoreVersion[];
  reviews: StoreReview[];
  download_url: string;
}

export interface Paginated<T> {
  items: T[];
  itemsCount: number;
  pagesCount: number;
  page: number;
}

export interface AuthUser {
  id: number;
  name: string;
  login: string;
  image_url: string | null;
  roles: string[];
  permissions: string[];
  domains: { id: number; name: string }[];
}

export interface BaseResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}
