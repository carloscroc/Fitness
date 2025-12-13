# MCP Server

This is a minimal, dependency-free Node server that exposes a basic MCP endpoint for local development.

Run locally:

```bash
node server/mcp/server.js
# or from project root after installing deps (none required):
npm run start:mcp
```

Endpoints:

- `GET /model_context_protocol/2025-03-26/mcp` — returns basic metadata
- `POST /model_context_protocol/2025-03-26/mcp` — echoes JSON body (placeholder)

Extend the handlers in `server/mcp/server.js` to implement the full MCP protocol behavior you need.
