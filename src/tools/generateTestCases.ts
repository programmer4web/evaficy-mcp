import { z } from "zod";
import type { EvaficyClient } from "../client/evaficyClient.js";
import type { GenerationJobEvent, GenerationResult, ScenarioDetail } from "../types.js";
import { toolError, toolJson } from "./result.js";

const TEST_TYPES = [
  "Functional",
  "Usability",
  "Compatibility",
  "Regression",
  "Smoke",
  "End-to-End",
  "Exploratory",
  "Boundary Edge Case",
  "Acceptance",
] as const;

const GENERATION_TIMEOUT_MS = 90_000;

export const generateTestCasesConfig = {
  title: "Generate Test Cases",
  description:
    "Generate AI test cases for a feature/page using Evaficy's platform generator, and optionally save them " +
    "as a new scenario in a project. This consumes the account's real AI-generation quota: Basic plan = 5 " +
    "generations LIFETIME (never resets), Advanced = 200/month, Enterprise = 500/month. Always produces " +
    "around 7 test cases; the count can't be requested.",
  inputSchema: {
    testType: z.enum(TEST_TYPES).describe("The kind of testing this covers."),
    affectedPage: z.string().optional().describe("The page or feature area under test, e.g. 'Checkout'."),
    requirement: z
      .string()
      .describe("The requirement or acceptance criteria to generate test cases for — this is the main input driving generation."),
    additionalCriteria: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .optional()
      .describe("Extra filtering criteria as label/value pairs, in addition to the requirement."),
    saveToProject: z
      .object({
        projectId: z.string().describe("Project to save the generated scenario into."),
        scenarioName: z.string().describe("Name for the new scenario."),
        scenarioDescription: z.string().optional(),
      })
      .optional()
      .describe("If provided, saves the generated test cases as a new scenario. If omitted, results are a preview only — nothing is saved."),
    resumeJobId: z
      .string()
      .optional()
      .describe(
        "Resume watching a previous generation job (from a prior 'still_running' response) instead of starting " +
          "a new, quota-consuming one. Only valid for 10 minutes after the original call."
      ),
  },
};

interface GenerateTestCasesInput {
  testType: (typeof TEST_TYPES)[number];
  affectedPage?: string;
  requirement: string;
  additionalCriteria?: { label: string; value: string }[];
  saveToProject?: { projectId: string; scenarioName: string; scenarioDescription?: string };
  resumeJobId?: string;
}

type JobOutcome =
  | { status: "done"; result: GenerationResult }
  | { status: "failed"; error: string | null }
  | { status: "still_running" };

export function generateTestCasesHandler(client: EvaficyClient) {
  return async (input: GenerateTestCasesInput) => {
    const { testType, affectedPage, requirement, additionalCriteria, saveToProject, resumeJobId } = input;

    try {
      const jobId = resumeJobId ?? (await startJob(client, testType, affectedPage, requirement, additionalCriteria));
      const outcome = await waitForJob(client, jobId);

      if (outcome.status === "still_running") {
        return toolJson({
          status: "still_running",
          jobId,
          message:
            "Generation is still in progress. Call generate_test_cases again with resumeJobId set to this " +
            "value to check for the result (valid for 10 minutes).",
        });
      }

      if (outcome.status === "failed") {
        return toolError(new Error(outcome.error ?? "Generation failed"));
      }

      const testCases = outcome.result.testCases;

      if (!saveToProject) {
        return toolJson({ saved: false, testCases });
      }

      const created = await client.post<{ scenario: ScenarioDetail }>("/scenarios/create", {
        name: saveToProject.scenarioName,
        description: saveToProject.scenarioDescription ?? "",
        project: saveToProject.projectId,
        testMetadata: {
          type: testType,
          affectedPage: affectedPage ?? "",
          customFields: [{ label: "Requirement", value: requirement }, ...(additionalCriteria ?? [])],
        },
        testCases,
      });

      return toolJson({
        saved: true,
        scenario: { _id: created.scenario._id, name: created.scenario.name, project: created.scenario.project },
        testCases,
      });
    } catch (err) {
      return toolError(err);
    }
  };
}

async function startJob(
  client: EvaficyClient,
  testType: string,
  affectedPage: string | undefined,
  requirement: string,
  additionalCriteria: { label: string; value: string }[] | undefined
): Promise<string> {
  const customFields = [{ label: "Requirement", value: requirement }, ...(additionalCriteria ?? [])];
  const { jobId } = await client.post<{ jobId: string }>("/test/generate", {
    t: testType,
    p: affectedPage ?? "",
    cf: JSON.stringify(customFields),
  });
  return jobId;
}

async function waitForJob(client: EvaficyClient, jobId: string): Promise<JobOutcome> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

  try {
    for await (const event of client.streamSSE(`/test/generate/${jobId}/stream`, controller.signal)) {
      const { status, result, error } = event as GenerationJobEvent;
      if (status === "done") return { status: "done", result: result as GenerationResult };
      if (status === "failed") return { status: "failed", error };
    }
    return { status: "still_running" };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { status: "still_running" };
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
