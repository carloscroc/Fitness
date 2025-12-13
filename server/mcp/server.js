// Minimal MCP-compatible endpoint server
// Usage: node server/mcp/server.js
import http from 'http';

const PORT = process.env.PORT ? Number(process.env.PORT) : 39300;

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  if (!url) return sendJSON(res, 400, { error: 'Missing URL' });

  // Normalize path
  const pathname = new URL(url, `http://localhost:${PORT}`).pathname;

  if (pathname === '/model_context_protocol/2025-03-26/mcp') {
    if (method === 'GET') {
      return sendJSON(res, 200, { ok: true, version: '2025-03-26', endpoint: 'mcp' });
    }

    if (method === 'POST' || method === 'PUT') {
      let body = '';
      for await (const chunk of req) body += chunk;
      let parsed = null;
      try {
        parsed = body ? JSON.parse(body) : null;
      } catch (e) {
        return sendJSON(res, 400, { error: 'invalid_json', message: e.message });
      }

      // Echo minimal MCP-style response for now
      return sendJSON(res, 200, {
        ok: true,
        received: parsed,
        note: 'Basic MCP endpoint — implement actual protocol handlers as required'
      });
    }

    return sendJSON(res, 405, { error: 'method_not_allowed' });
  }

  // Root info
  if (pathname === '/' && method === 'GET') {
    return sendJSON(res, 200, { service: 'mcp-server', port: PORT });
  }

  sendJSON(res, 404, { error: 'not_found' });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MCP server listening on http://localhost:${PORT}/model_context_protocol/2025-03-26/mcp`);
});

export default server;
