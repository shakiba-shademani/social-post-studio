import express, { type ErrorRequestHandler } from 'express';
import { draftsRouter } from './features/drafts/drafts.routes.ts';

const host = '127.0.0.1';
const port = Number(process.env.PORT ?? 3000);

const app = express();
app.disable('x-powered-by');
app.enable('case sensitive routing');
app.enable('strict routing');

app.head('/health', (_request, response) => {
  response.status(404).json({ error: 'Not found' });
});
app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});
app.use(draftsRouter);
const handleError: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }
  console.error('Request failed', error);
  response.status(500).json({ error: 'Internal server error' });
};
app.use(handleError);
app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

const server = app.listen(port, host, (error) => {
  if (error) {
    throw error;
  }
  const address = server.address();
  if (address && typeof address === 'object') {
    console.log(`Social Post Studio server listening at http://${host}:${address.port}`);
  }
});
