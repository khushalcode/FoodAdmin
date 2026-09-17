// ApiClient — ported from Flutter lib/api/api_client.dart.
// Provides HTTP methods that mirror the Flutter app's REST contract.
// All endpoints are listed in src/constants/app_constants.ts.

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConstants } from '../constants/app_constants';

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  isForm?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private timeoutMs: number = 20000;

  constructor(baseUrl: string = AppConstants.baseUrl) {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  private async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      try { return localStorage.getItem(AppConstants.token); } catch { return null; }
    }
    try {
      return await AsyncStorage.getItem(AppConstants.token);
    } catch {
      return null;
    }
  }

  async setToken(token: string | null) {
    if (Platform.OS === 'web') {
      if (token) localStorage.setItem(AppConstants.token, token);
      else localStorage.removeItem(AppConstants.token);
      return;
    }
    if (token) await AsyncStorage.setItem(AppConstants.token, token);
    else await AsyncStorage.removeItem(AppConstants.token);
  }

  private buildUrl(uri: string, query?: RequestOptions['query']): string {
    const url = `${this.baseUrl}${uri}`;
    if (!query) return url;
    const params = Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    return params ? `${url}${url.includes('?') ? '&' : '?'}${params}` : url;
  }

  private async buildHeaders(opts: RequestOptions = {}): Promise<HeadersInit> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': opts.isForm ? 'multipart/form-data' : 'application/json',
      ...(opts.headers ?? {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async request<T = any>(uri: string, opts: RequestOptions = {}): Promise<ApiResponse<T>> {
    const method = opts.method ?? 'GET';
    const url = this.buildUrl(uri, opts.query);
    const headers = await this.buildHeaders(opts);

    let body: BodyInit | undefined;
    if (opts.body !== undefined && method !== 'GET') {
      body = opts.isForm ? opts.body : JSON.stringify(opts.body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const text = await res.text();
      let json: any;
      try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }

      // Flutter's ApiChecker: codes 200..299 = success
      if (res.ok) {
        return {
          code: json.code ?? res.status,
          data: json.data ?? json,
          message: json.message,
        };
      }
      throw new ApiError(res.status, json.message ?? 'Request failed', json.errors, json);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err instanceof ApiError) throw err;
      if (err.name === 'AbortError') {
        throw new ApiError(-1, 'Request timed out');
      }
      throw new ApiError(-1, err.message ?? 'Network error');
    }
  }

  async getData<T = any>(uri: string, query?: RequestOptions['query']): Promise<ApiResponse<T>> {
    return this.request<T>(uri, { method: 'GET', query });
  }

  async postData<T = any>(uri: string, body?: any, query?: RequestOptions['query']): Promise<ApiResponse<T>> {
    return this.request<T>(uri, { method: 'POST', body, query });
  }

  async putData<T = any>(uri: string, body?: any, query?: RequestOptions['query']): Promise<ApiResponse<T>> {
    return this.request<T>(uri, { method: 'PUT', body, query });
  }

  async deleteData<T = any>(uri: string, query?: RequestOptions['query']): Promise<ApiResponse<T>> {
    return this.request<T>(uri, { method: 'DELETE', query });
  }

  async multipartRequest<T = any>(uri: string, fields: Record<string, string>, files: { field: string; uri: string; name?: string; type?: string }[]): Promise<ApiResponse<T>> {
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) form.append(k, v);
    for (const f of files) {
      form.append(f.field, {
        uri: f.uri,
        name: f.name ?? 'upload.jpg',
        type: f.type ?? 'image/jpeg',
      } as any);
    }
    return this.request<T>(uri, { method: 'POST', body: form, isForm: true });
  }
}

export class ApiError extends Error {
  code: number;
  errors?: Record<string, string[]>;
  raw?: any;
  constructor(code: number, message: string, errors?: Record<string, string[]>, raw?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.errors = errors;
    this.raw = raw;
  }
}

export const apiClient = new ApiClient();

// ApiChecker — ported from Flutter lib/api/api_checker.dart
export const ApiChecker = {
  isSuccess(code: number): boolean {
    return code >= 200 && code < 300;
  },
  isUnauthorized(code: number): boolean {
    return code === 401 || code === 403;
  },
  isNotFound(code: number): boolean {
    return code === 404;
  },
  isValidationError(code: number): boolean {
    return code === 400 || code === 422;
  },
  isServer(code: number): boolean {
    return code >= 500;
  },
};

// ResponseModel — ported from Flutter lib/common/models/response_model.dart
export interface ResponseModel {
  isSuccess: boolean;
  message: string;
}

export function makeResponse(isSuccess: boolean, message: string): ResponseModel {
  return { isSuccess, message };
}
