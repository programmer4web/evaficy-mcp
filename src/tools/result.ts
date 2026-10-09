import { EvaficyApiError } from "../client/evaficyClient.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function toolJson(data: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

export function toolError(err: unknown): CallToolResult {
  const message = err instanceof EvaficyApiError ? `(${err.status}) ${err.message}` : err instanceof Error ? err.message : "Unknown error";
  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}
