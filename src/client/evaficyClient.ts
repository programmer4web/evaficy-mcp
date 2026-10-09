import type { Config } from "../config.js";
import type { ApiErrorBody } from "../types.js";

export class EvaficyApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = "EvaficyApiError";
  }
}

export class EvaficyClient {
  constructor(private config: Config) {}

  async get<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(this.config.apiUrl + path);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        Accept: "application/json",
      },
    });

    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (!response.ok) {
      const errorBody = body as unknown as ApiErrorBody;
      const message = errorBody.message || errorBody.error || `Request failed with status ${response.status}`;
      throw new EvaficyApiError(response.status, message, errorBody.code);
    }

    return body as T;
  }
}
