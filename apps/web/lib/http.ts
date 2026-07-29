import axios, { type AxiosError } from 'axios';

/** Default request timeout for app HTTP via BFF (ms). */
export const DEFAULT_API_TIMEOUT_MS = 30_000;

const FALLBACK_MESSAGE = 'Произошла ошибка. Попробуйте снова.';

/**
 * App-level HTTP error: Nest-style body.message (string | string[]) or RU fallback.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Extract user-facing message from Nest / BFF error JSON body.
 */
export function messageFromResponseData(data: unknown): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const { message } = data as { message?: unknown };
    if (Array.isArray(message)) {
      const joined = message
        .filter((m) => typeof m === 'string' && m)
        .join(', ');
      if (joined) {
        return joined;
      }
    } else if (typeof message === 'string' && message) {
      return message;
    }
  }
  return FALLBACK_MESSAGE;
}

export const api = axios.create({
  withCredentials: true,
  timeout: DEFAULT_API_TIMEOUT_MS,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      return Promise.reject(
        new ApiError(
          error.response.status,
          messageFromResponseData(error.response.data),
        ),
      );
    }
    return Promise.reject(error);
  },
);
