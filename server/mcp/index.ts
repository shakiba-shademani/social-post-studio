import { createServer } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './server.ts';

const port = Number(process.env.PORT ?? process.env.MCP_PORT ?? 3001);
const host = process.env.PORT ? '0.0.0.0' : '127.0.0.1';

const httpServer = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  if (pathname !== '/mcp' || !['POST', 'GET', 'DELETE'].includes(request.method ?? '')) {
    response.writeHead(404).end('Not found');
    return;
  }

  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  response.on('close', () => {
    void transport.close();
    void server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(request, response);
  } catch (error) {
    console.error('MCP request failed', error);
    if (!response.headersSent) response.writeHead(500).end('Internal server error');
  }
});

httpServer.listen(port, host, () => {
  const address = httpServer.address();
  if (address && typeof address === 'object') {
    console.log(`MCP server listening at http://${host}:${address.port}/mcp`);
  }
});
