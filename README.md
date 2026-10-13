# evaficy-mcp

An MCP (Model Context Protocol) server for [Evaficy Smart Test](https://app.evaficy.com). It lets an AI client (Claude Code, Cline, Cursor, etc.) read your projects, test cases and run results directly from your editor.

This is **v0.5.1**: six read-only tools plus one write tool, `generate_test_cases`.

## Tools

| Tool | Type | What it does |
|---|---|---|
| `list_projects` | read | List all projects you own or belong to |
| `get_project` | read | Full detail for one project (members, environments, client) |
| `list_test_cases` | read | List test-case scenarios for a project |
| `get_test_case` | read | Full scenario detail: steps, test data, validation status |
| `list_runs` | read | List test runs, optionally filtered by project/status |
| `get_run_results` | read | A run's execution detail plus its condensed report |
| `generate_test_cases` | **write** | Generate ~7 AI test cases from a requirement, optionally saving them as a new scenario in a project |

### About `generate_test_cases`

- Takes a `testType`, a `requirement` (the main input — the more specific, the better the result), and optionally `affectedPage` and `additionalCriteria`.
- **Preview by default.** Pass `saveToProject` (`{projectId, scenarioName}`) to persist the result as a new scenario instead — without it, nothing is saved anywhere.
- **Consumes your real AI-generation quota**, the same one the app's UI uses: Basic = 5 generations **lifetime** (never resets), Advanced = 200/month, Enterprise = 500/month. There's no undo on a Basic-plan call.
- Generation can take a little while; if it's still running after ~90 seconds the tool returns a `jobId` instead of a result — call it again with `resumeJobId` set to that value to pick up where it left off (results are only kept for 10 minutes).
- The number of test cases generated (~7) isn't configurable — that's fixed by the underlying platform feature.

## 1. Create a Personal Access Token

In the Evaficy app https://app.evaficy.com login then go to: **Settings → API tokens → Create Token**.

- Give it a name you'll recognize later (e.g. "Evaficy MCP - laptop").
- The raw token is shown **once**, right after creation — copy it immediately, it can't be retrieved again.
- The dialog doesn't currently let you set an expiry from the UI; the token won't expire unless you set one via the API directly. Treat it like a password and revoke it from the same Settings page if it's ever exposed.

## 2. Configure your client

Set the environment variable in .env file:

- `EVAFICY_TOKEN` — the token from step 1 (required)

### Claude Code

```
claude mcp add evaficy -e EVAFICY_TOKEN=<your-token> -- npx evaficy-mcp
```

### Cline (VS Code)

Add to Cline's MCP settings file:

```json
{
  "mcpServers": {
    "evaficy": {
      "command": "npx",
      "args": ["evaficy-mcp"],
      "env": {
        "EVAFICY_TOKEN": "<your-token>"
      }
    }
  }
}
```

## Example flow

Once configured, you just talk to your AI client in plain language — it picks the right tool and fills in the parameters. A typical session, going from "what do I have" to "generate and save tests for it":

**1. List your projects**

> List my Evaficy projects.

Calls `list_projects`. Returns every project you own or belong to, each with its id, your role, and counts (scenarios, members) — this is how you find the project id you'll need in step 2.

**2. Generate test cases for one of them**

> Generate functional test cases for the Checkout page in project `<projectId from step 1>` (or `<Project Name>`) requirement: "Users must be able to apply a discount code before payment and see the updated total." Save them as a new scenario called "Discount Code at Checkout".

Calls `generate_test_cases` with `saveToProject` set. Returns the ~7 AI-generated test cases (title, steps, expected results, test data) together with the id/name of the scenario that was just created in that project — from here it's immediately visible in the Evaficy app too.

Leave out the "save them as..." part and it returns the same generated test cases as a preview only, without creating anything — useful for reviewing before you decide whether to keep them.

**A note on project names vs. IDs:** every tool's `projectId` input needs a real project id, not a name — but you don't have to look that up yourself. Referring to a project by name in your prompt (like "the Sample Project" above) works fine: your AI client resolves it to an id itself, by calling `list_projects` first (as in step 1) and matching the name, then passing that id to the tool. This happens automatically as part of the conversation — it's not something this server does internally.

## Notes

- The six read tools never create, modify, or delete anything. `generate_test_cases` is the one exception — it always calls the platform's AI generator (consuming quota), and will also create a new scenario if you pass `saveToProject`.
- Your token is read from the environment only; it is never logged or written to disk by this server.
- A token inherits the permissions of the account that created it.

## License

MIT
