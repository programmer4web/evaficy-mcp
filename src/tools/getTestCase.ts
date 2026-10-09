import { z } from "zod";
import type { EvaficyClient } from "../client/evaficyClient.js";
import type { ScenarioDetail } from "../types.js";
import { toolError, toolJson } from "./result.js";

export const getTestCaseConfig = {
  title: "Get Test Case",
  description:
    "Get the full scenario for one test case, including every test case's steps, test data and validation status. " +
    "Note: in Evaficy, test cases are grouped into a 'scenario' document, so this returns the whole scenario " +
    "(its testCases array holds the individual test cases).",
  inputSchema: {
    scenarioId: z.string().describe("The scenario's Mongo ObjectId, as returned by list_test_cases."),
  },
};

export function getTestCaseHandler(client: EvaficyClient) {
  return async ({ scenarioId }: { scenarioId: string }) => {
    try {
      const data = await client.get<{ scenario: ScenarioDetail }>(`/scenarios/${scenarioId}`);
      return toolJson(data.scenario);
    } catch (err) {
      return toolError(err);
    }
  };
}
