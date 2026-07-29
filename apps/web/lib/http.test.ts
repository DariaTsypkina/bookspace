import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ApiError,
  api,
  DEFAULT_API_TIMEOUT_MS,
  messageFromResponseData,
} from './http';

const FALLBACK_MESSAGE = 'Произошла ошибка. Попробуйте снова.';

/** Mimics built-in adapters: non-2xx → AxiosError (custom adapter skips settle). */
function mockAdapter(status: number, data: unknown): AxiosAdapter {
  return async (config) => {
    const response: AxiosResponse = {
      data,
      status,
      statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
      headers: {},
      config: config as InternalAxiosRequestConfig,
    };
    const validateStatus =
      config.validateStatus ?? ((s: number) => s >= 200 && s < 300);
    if (!validateStatus(status)) {
      throw new AxiosError(
        `Request failed with status code ${status}`,
        AxiosError.ERR_BAD_RESPONSE,
        config,
        undefined,
        response,
      );
    }
    return response;
  };
}

describe('messageFromResponseData', () => {
  it('returns string message from body', () => {
    expect(messageFromResponseData({ message: 'Нет доступа' })).toBe(
      'Нет доступа',
    );
  });

  it('joins string[] message with comma', () => {
    expect(
      messageFromResponseData({ message: ['Поле email', 'Поле password'] }),
    ).toBe('Поле email, Поле password');
  });

  it('returns RU fallback when message missing or empty', () => {
    expect(messageFromResponseData({})).toBe(FALLBACK_MESSAGE);
    expect(messageFromResponseData({ message: '' })).toBe(FALLBACK_MESSAGE);
    expect(messageFromResponseData({ message: [] })).toBe(FALLBACK_MESSAGE);
    expect(messageFromResponseData(null)).toBe(FALLBACK_MESSAGE);
    expect(messageFromResponseData('raw')).toBe(FALLBACK_MESSAGE);
  });
});

describe('api client', () => {
  const originalAdapter = api.defaults.adapter;

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
  });

  it('is configured with withCredentials and timeout', () => {
    expect(api.defaults.withCredentials).toBe(true);
    expect(api.defaults.timeout).toBe(DEFAULT_API_TIMEOUT_MS);
  });

  it('resolves 2xx without throwing ApiError', async () => {
    api.defaults.adapter = mockAdapter(200, { ok: true });

    const response = await api.get('/health');

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: true });
  });

  it('rejects non-2xx with ApiError and string message', async () => {
    api.defaults.adapter = mockAdapter(403, { message: 'Нет доступа' });

    await expect(api.get('/secure')).rejects.toSatisfy((err: unknown) => {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(403);
      expect(apiErr.message).toBe('Нет доступа');
      return true;
    });
  });

  it('rejects non-2xx with ApiError joining string[] message', async () => {
    api.defaults.adapter = mockAdapter(400, {
      message: ['Слишком короткий', 'Нужна цифра'],
    });

    await expect(api.post('/register')).rejects.toSatisfy((err: unknown) => {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(400);
      expect(apiErr.message).toBe('Слишком короткий, Нужна цифра');
      return true;
    });
  });

  it('rejects non-2xx with ApiError fallback when body has no message', async () => {
    api.defaults.adapter = mockAdapter(500, {});

    await expect(api.get('/boom')).rejects.toSatisfy((err: unknown) => {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(500);
      expect(apiErr.message).toBe(FALLBACK_MESSAGE);
      return true;
    });
  });
});
