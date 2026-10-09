import { z } from "zod";
import type { EvaficyClient } from "../client/evaficyClient.js";
import type { ScenarioListResponse } from "../types.js";
import { toolError, toolJson } from "./result.js";

export const listTestCasesConfig = {
  title: "List Test Cases",
  description:
    "List test-case scenarios for a project. Each scenario is a group of related test cases; " +
    "use get_test_case to fetch the full steps and test data for one scenario.",
  inputSchema: {
    projectId: z.string().describe("The Evaficy project's Mongo ObjectId, as returned by list_projects."),
    limit: z.number().int().min(1).max(100).optional().describe("Max scenarios to return (default 50, max 100)."),
    offset: z.number().int().min(0).optional().describe("Number of scenarios to skip, for pagination."),
  },
};

export function listTestCasesHandler(client: EvaficyClient) {
  return async ({ projectId, limit, offset }: { projectId: string; limit?: number; offset?: number }) => {
    try {
      const data = await client.get<ScenarioListResponse>("/scenarios", {
        project: projectId,
        limit,
        offset,
      });
      return toolJson({
        scenarios: data.scenarios,
        total: data.total,
        limit: data.limit,
        offset: data.offset,
        hasMore: data.hasMore,
      });
    } catch (err) {
      return toolError(err);
    }
  };
}
