# evaficy-mcp

An MCP (Model Context Protocol) server for [Evaficy Smart Test](https://app.evaficy.com). It lets an AI client (Claude Code, Cline, Cursor, etc.) read your projects, test cases and run results directly from your editor.

This is **v0.5**: a light, read-only first slice. Six tools, no write actions yet.

## Tools

| Tool | What it does |
|---|---|
| `list_projects` | List all projects you own or belong to |
| `get_project` | Full detail for one project (members, environments, client) |
| `list_test_cases` | List test-case scenarios for a project |
| `get_test_case` | Full scenario detail: steps, test data, validation status |
| `list_runs` | List test runs, optionally filtered by project/status |
| `get_run_results` | A run's execution detail plus its condensed report |

## 1. Create a Personal Access Token

In the Evaficy app: **Settings → API tokens → Create Token**.

- Give it a name you'll recognize later (e.g. "MCP - laptop").
- The raw token is shown **once**, right after creation — copy it immediately, it can't be retrieved again.
- The dialog doesn't currently let you set an expiry from the UI; the token won't expire unless you set one via the API directly. Treat it like a password and revoke it from the same Settings page if it's ever exposed.

## 2. Configure your client

Set two environment variables:

- `EVAFICY_TOKEN` — the token from step 1 (required)
- `EVAFICY_API_URL` — defaults to `https://app.evaficy.com`, override only for local backend development

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

- All six tools are read-only wrappers over the existing Evaficy API — nothing is created, modified, or deleted.
- Your token is read from the environment only; it is never logged or written to disk by this server.
- A token inherits the permissions of the account that created it — if you can't see a project in the app, the MCP won't be able to see it either.

## License

MIT
