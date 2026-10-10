#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadConfig } from "./config.js";
import { EvaficyClient } from "./client/evaficyClient.js";
import { listProjectsConfig, listProjectsHandler } from "./tools/listProjects.js";
import { getProjectConfig, getProjectHandler } from "./tools/getProject.js";
import { listTestCasesConfig, listTestCasesHandler } from "./tools/listTestCases.js";
import { getTestCaseConfig, getTestCaseHandler } from "./tools/getTestCase.js";
import { listRunsConfig, listRunsHandler } from "./tools/listRuns.js";
import { getRunResultsConfig, getRunResultsHandler } from "./tools/getRunResults.js";
import { generateTestCasesConfig, generateTestCasesHandler } from "./tools/generateTestCases.js";

const config = loadConfig();
const client = new EvaficyClient(config);

const server = new McpServer({
  name: "evaficy-mcp",
  version: "0.5.1",
});

server.registerTool("list_projects", listProjectsConfig, listProjectsHandler(client));
server.registerTool("get_project", getProjectConfig, getProjectHandler(client));
server.registerTool("list_test_cases", listTestCasesConfig, listTestCasesHandler(client));
server.registerTool("get_test_case", getTestCaseConfig, getTestCaseHandler(client));
server.registerTool("list_runs", listRunsConfig, listRunsHandler(client));
server.registerTool("get_run_results", getRunResultsConfig, getRunResultsHandler(client));
server.registerTool("generate_test_cases", generateTestCasesConfig, generateTestCasesHandler(client));

const transport = new StdioServerTransport();
await server.connect(transport);
