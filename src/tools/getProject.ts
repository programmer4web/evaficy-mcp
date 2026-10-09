import { z } from "zod";
import type { EvaficyClient } from "../client/evaficyClient.js";
import type { ProjectDetail } from "../types.js";
import { toolError, toolJson } from "./result.js";

export const getProjectConfig = {
  title: "Get Project",
  description: "Get full detail for one Evaficy project, including members, environments and the linked client.",
  inputSchema: {
    projectId: z.string().describe("The Evaficy project's Mongo ObjectId, as returned by list_projects."),
  },
};

export function getProjectHandler(client: EvaficyClient) {
  return async ({ projectId }: { projectId: string }) => {
    try {
      const data = await client.get<{ project: ProjectDetail }>(`/projects/${projectId}`);
      return toolJson(data.project);
    } catch (err) {
      return toolError(err);
    }
  };
}
