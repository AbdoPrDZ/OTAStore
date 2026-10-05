import type { BaseResponse } from './types';

export const DEFAULT_BASE_URL = 'http://172.16.40.112:80';

function normalize(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

/**
 * The server base URL. It is a compile-time constant so a Metro reload is
 * enough to point the app at a different server. The dev server must be
 * reachable from the device (bind it with `php artisan serve --host=0.0.0.0`).
 */
export async function resolveBaseUrl(): Promise<string> {
  return DEFAULT_BASE_URL;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  query?: Record<string, QueryValue>;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
}

function buildUrl(base: string, path: string, query?: Record<string, QueryValue>): string {
  const clean = `${normalize(base)}/api${path.startsWith('/') ? path : `/${path}`}`;

  if (!query) {
    return clean;
  }

  const parts: string[] = [];

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  });

  return parts.length ? `${clean}?${parts.join('&')}` : clean;
}

/**
 * Issues a JSON request against OTACenter and unwraps the shared
 * `{ success, message, ... }` envelope, throwing {@link ApiError} on failure.
 */
export async function apiRequest<T extends BaseResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const base = await resolveBaseUrl();
  const url = buildUrl(base, path, options.query);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers ?? {}),
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : 'Network request failed',
      0,
    );
  }

  const text = await response.text();
  let json: (T & { errors?: Record<string, string> }) | null = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError('The server returned an unexpected response.', response.status);
  }

  if (!response.ok || !json || json.success === false) {
    throw new ApiError(
      json?.message || `Request failed (${response.status})`,
      response.status,
      json?.errors,
    );
  }

  return json;
}

/**
 * Uploads a `FormData` body (multipart). Content-Type is deliberately left
 * unset so the platform adds the multipart boundary.
 */
export async function apiUpload<T extends BaseResponse>(
  path: string,
  formData: FormData,
  token?: string | null,
): Promise<T> {
  const base = await resolveBaseUrl();
  const url = buildUrl(base, path);

  const headers: Record<string, string> = { Accept: 'application/json' };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData as unknown as RequestInit['body'],
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : 'Network request failed',
      0,
    );
  }

  const text = await response.text();
  let json: (T & { errors?: Record<string, string> }) | null = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError('The server returned an unexpected response.', response.status);
  }

  if (!response.ok || !json || json.success === false) {
    throw new ApiError(
      json?.message || `Request failed (${response.status})`,
      response.status,
      json?.errors,
    );
  }

  return json;
}
