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

## Notes

- The six read tools never create, modify, or delete anything. `generate_test_cases` is the one exception — it always calls the platform's AI generator (consuming quota), and will also create a new scenario if you pass `saveToProject`.
- Your token is read from the environment only; it is never logged or written to disk by this server.
- A token inherits the permissions of the account that created it.

## License

MIT
