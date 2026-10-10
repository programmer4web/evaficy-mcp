import type { Config } from "../config.js";
import type { ApiErrorBody } from "../types.js";

export class EvaficyApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = "EvaficyApiError";
  }
}

async function parseErrorBody(response: Response): Promise<EvaficyApiError> {
  const body = (await response.json().catch(() => ({}))) as unknown as ApiErrorBody;
  const message = body.message || body.error || `Request failed with status ${response.status}`;
  return new EvaficyApiError(response.status, message, body.code);
}

export class EvaficyClient {
  constructor(private config: Config) {}

  private authHeaders(accept: string): Record<string, string> {
    return { Authorization: `Bearer ${this.config.token}`, Accept: accept };
  }

  async get<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(this.config.apiUrl + path);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, { method: "GET", headers: this.authHeaders("application/json") });
    if (!response.ok) throw await parseErrorBody(response);
    return (await response.json()) as T;
  }

  async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(this.config.apiUrl + path, {
      method: "POST",
      headers: { ...this.authHeaders("application/json"), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw await parseErrorBody(response);
    return (await response.json()) as T;
  }

  /** Consumes a Server-Sent Events stream, yielding each event's parsed `data:` JSON payload. */
  async *streamSSE(path: string, signal: AbortSignal): AsyncGenerator<unknown> {
    const response = await fetch(this.config.apiUrl + path, {
      method: "GET",
      headers: this.authHeaders("text/event-stream"),
      signal,
    });
    if (!response.ok) throw await parseErrorBody(response);
    if (!response.body) throw new Error("No response body for SSE stream");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sepIndex: number;
        while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
          const rawEvent = buffer.slice(0, sepIndex);
          buffer = buffer.slice(sepIndex + 2);

          const dataLines = rawEvent.split("\n").filter((line) => line.startsWith("data:"));
          if (dataLines.length === 0) continue;

          const jsonText = dataLines.map((line) => line.slice(5).trimStart()).join("\n");
          try {
            yield JSON.parse(jsonText);
          } catch {
            // Malformed frame — skip rather than crash the whole stream.
          }
        }
      }
    } finally {
      reader.cancel().catch(() => {});
    }
  }
}
