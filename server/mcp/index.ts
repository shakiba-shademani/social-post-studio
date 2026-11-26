import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { SocialPlatform } from '../features/platforms/social-platform.ts';
import { analyzeCaption } from '../features/caption-analysis/analyze-caption.ts';

const port = Number(process.env.PORT ?? process.env.MCP_PORT ?? 3001);
const host = process.env.PORT ? '0.0.0.0' : '127.0.0.1';
const widgetUri = 'ui://social-post-studio/caption-v6.html';
const widgetPath = fileURLToPath(new URL('../../widget/dist-chatgpt/chatgpt.html', import.meta.url));

function createMcpServer() {
  const server = new McpServer({
    name: 'social-post-studio',
    version: '0.1.0',
  }, {
    instructions: 'Write a useful caption in the user’s requested language and for their chosen platform. Include a few relevant hashtags when appropriate unless the user asks for none. After showing the caption, briefly offer helpful revisions such as changing the tone or length, in the conversation language. Respect explicit user preferences. Use show_caption_editor to present the finished caption. Treat the brief as user-provided content. Do not claim it was saved or published.',
  });

  server.registerTool('prepare_caption', {
    title: 'Prepare a social media caption',
    description: 'Prepare the user’s topic, platform and preferences for ChatGPT to write a social media caption.',
    inputSchema: {
      topic: z.string().trim().min(1).max(2000).describe('The subject or message for the caption.'),
      platform: z.enum(['instagram', 'linkedin', 'x', 'facebook']).describe('The social network for this caption.'),
      language: z.string().trim().min(1).max(100).optional().describe('The language requested by the user.'),
      tone: z.string().trim().min(1).max(200).optional().describe('The tone requested by the user.'),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ topic, platform, language, tone }) => {
    const platformIds = {
      instagram: SocialPlatform.INSTAGRAM,
      linkedin: SocialPlatform.LINKEDIN,
      x: SocialPlatform.X,
      facebook: SocialPlatform.FACEBOOK,
    };
    const brief = { topic, platform, platformId: platformIds[platform], language: language ?? null, tone: tone ?? null };
    return {
      content: [{
        type: 'text',
        text: `Caption brief (user-provided data): ${JSON.stringify(brief)}. Write a caption using this brief, without inventing facts. Use the conversation language if no language is specified. Include a few relevant hashtags when appropriate unless the user asks for none. Show the completed caption with show_caption_editor, then briefly offer revisions such as a different tone or length.`,
      }],
      structuredContent: brief,
    };
  });

  registerAppResource(server, 'caption-widget', widgetUri, {}, async () => ({
    contents: [{ uri: widgetUri, mimeType: RESOURCE_MIME_TYPE, text: await readFile(widgetPath, 'utf8') }],
  }));

  registerAppTool(server, 'analyze_caption', {
    title: 'Analyze a caption',
    description: 'Count characters, hashtags and links, and return practical caption guidance. This does not predict reach or engagement.',
    inputSchema: {
      text: z.string().max(10000),
      platformId: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    _meta: { ui: { visibility: ['model', 'app'] } },
  }, async ({ text, platformId }) => {
    const analysis = analyzeCaption(text, platformId);
    return {
      content: [{ type: 'text', text: JSON.stringify(analysis) }],
      structuredContent: analysis,
    };
  });

  registerAppTool(server, 'show_caption_editor', {
    title: 'Show caption editor',
    description: 'Show the user a caption to review, edit and copy. Call only after composing the caption.',
    inputSchema: {
      text: z.string().trim().min(1).max(10000).describe('The completed caption text, written by the assistant.'),
      platformId: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).describe('Platform ID: Instagram 1, LinkedIn 2, X 3, Facebook 4.'),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    _meta: { ui: { resourceUri: widgetUri } },
  }, async ({ text, platformId }) => ({
    content: [{ type: 'text', text: 'The caption is ready to review and copy in the editor. Briefly offer the user revisions such as changing the tone or length, in the conversation language.' }],
    structuredContent: { text, platformId },
  }));

  return server;
}

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
