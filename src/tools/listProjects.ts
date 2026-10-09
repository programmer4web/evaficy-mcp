import type { EvaficyClient } from "../client/evaficyClient.js";
import type { ProjectSummary } from "../types.js";
import { toolError, toolJson } from "./result.js";

export const listProjectsConfig = {
  title: "List Projects",
  description: "List all Evaficy projects the current user owns or is a member of.",
  inputSchema: {},
};

export function listProjectsHandler(client: EvaficyClient) {
  return async () => {
    try {
      const data = await client.get<{ projects: ProjectSummary[] }>("/projects");
      return toolJson(data.projects);
    } catch (err) {
      return toolError(err);
    }
  };
}
