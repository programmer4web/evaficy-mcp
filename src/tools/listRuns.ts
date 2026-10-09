import { z } from "zod";
import type { EvaficyClient } from "../client/evaficyClient.js";
import type { RunListItem } from "../types.js";
import { toolError, toolJson } from "./result.js";

export const listRunsConfig = {
  title: "List Test Runs",
  description:
    "List test runs, optionally filtered by project and/or status. Use this to find a run's id before calling get_run_results.",
  inputSchema: {
    projectId: z.string().optional().describe("Limit to runs in this project (Mongo ObjectId). Omit to list across all accessible projects."),
    status: z
      .enum(["draft", "in_progress", "completed", "aborted"])
      .optional()
      .describe("Filter by run status."),
  },
};

export function listRunsHandler(client: EvaficyClient) {
  return async ({ projectId, status }: { projectId?: string; status?: string }) => {
    try {
      const data = await client.get<{ runs: RunListItem[]; total: number }>("/runs", {
        project: projectId,
        status,
      });
      return toolJson(data);
    } catch (err) {
      return toolError(err);
    }
  };
}
