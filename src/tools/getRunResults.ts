import { z } from "zod";
import type { EvaficyClient } from "../client/evaficyClient.js";
import type { RunDetail, RunReport } from "../types.js";
import { toolError, toolJson } from "./result.js";

export const getRunResultsConfig = {
  title: "Get Run Results",
  description:
    "Get a test run's full execution detail (per-test-case results) together with its condensed report " +
    "(summary counts, failed/blocked tests, execution timeline).",
  inputSchema: {
    runId: z.string().describe("The test run's Mongo ObjectId, as returned by list_runs."),
  },
};

export function getRunResultsHandler(client: EvaficyClient) {
  return async ({ runId }: { runId: string }) => {
    try {
      const [runData, reportData] = await Promise.all([
        client.get<{ run: RunDetail }>(`/runs/${runId}`),
        client.get<{ report: RunReport }>(`/runs/${runId}/report`),
      ]);
      return toolJson({ run: runData.run, report: reportData.report });
    } catch (err) {
      return toolError(err);
    }
  };
}
