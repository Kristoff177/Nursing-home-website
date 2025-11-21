import type { DocumentationEntry, OptimizationResult } from '../types/documentation';

const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;
const TIMEOUT_MS = parseInt(import.meta.env.VITE_TIMEOUT_MS || '20000', 10);

export class ApiTimeoutError extends Error {
  constructor() {
    super('Der Dienst braucht länger als erwartet. Bitte erneut versuchen.');
    this.name = 'ApiTimeoutError';
  }
}

export class ApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiTimeoutError();
    }
    throw error;
  }
}

export async function optimizeDocumentation(
  entry: DocumentationEntry
): Promise<OptimizationResult> {
  try {
    const response = await fetchWithTimeout(
      MAKE_WEBHOOK_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify(entry),
      },
      TIMEOUT_MS
    );

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    const result = await response.json();
    return result as OptimizationResult;
  } catch (error) {
    if (error instanceof ApiTimeoutError || error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Ein unerwarteter Fehler ist aufgetreten.');
  }
}
