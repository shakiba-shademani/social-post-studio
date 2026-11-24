import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import { isPlatformId } from '../platforms/social-platform.ts';
import { addDraft, deleteDraft, getDraftImage, listDrafts, updateDraft } from './drafts.store.ts';

export const draftsRouter = express.Router({ caseSensitive: true, strict: true });

const saveDraft: RequestHandler = async (request, response) => {
  const id = request.params.id;
  if (id !== undefined && (typeof id !== 'string' || !isValidId(id))) {
    response.status(400).json({ error: 'Invalid draft ID' });
    return;
  }
  const body: unknown = request.body;
  let input: unknown;

  try {
    input = JSON.parse(Buffer.isBuffer(body) ? body.toString('utf8') : '');
  } catch {
    response.status(400).json({ error: 'Expected a valid JSON request body' });
    return;
  }

  if (typeof input !== 'object' || input === null || !('platformId' in input) || !isPlatformId(input.platformId)) {
    response.status(400).json({ error: 'platformId must be a supported numeric platform ID' });
    return;
  }
  if (!('text' in input) || typeof input.text !== 'string' || input.text.trim().length === 0) {
    response.status(400).json({ error: 'text must be a non-empty string' });
    return;
  }

  let image: { data: Buffer; type: string } | null | undefined;
  if ('image' in input) {
    if (input.image === null) {
      image = null;
    } else if (typeof input.image === 'string') {
      const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(input.image);
      if (!match || match[2].length % 4 !== 0) {
        response.status(400).json({ error: 'Image must be a PNG, JPEG or WebP data URL' });
        return;
      }
      const data = Buffer.from(match[2], 'base64');
      const valid = match[1] === 'png' ? data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : match[1] === 'jpeg' ? data.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
        : data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP';
      if (!valid || data.length > 4 * 1024 * 1024) {
        response.status(400).json({ error: 'Image must be a valid PNG, JPEG or WebP up to 4 MiB' });
        return;
      }
      image = { data, type: `image/${match[1]}` };
    } else {
      response.status(400).json({ error: 'Invalid image' });
      return;
    }
  }

  if (id === undefined) {
    const draft = await addDraft(input.platformId, input.text, image);
    response.status(201).json(draft);
    return;
  }
  const draft = await updateDraft(id, input.platformId, input.text, image);
  if (!draft) {
    response.status(404).json({ error: 'Draft not found' });
    return;
  }
  response.json(draft);
};

function isValidId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

const handleDraftBodyError: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent || response.destroyed) {
    return next(error);
  }
  if (typeof error === 'object' && error !== null && 'status' in error) {
    if (error.status === 413) {
      response.status(413).set('Connection', 'close').json({ error: 'Request body exceeds 6 MiB' });
      return;
    }
    if (error.status === 400 || error.status === 415) {
      response.status(400).json({ error: 'Expected a valid JSON request body' });
      return;
    }
  }
  next(error);
};

// Preserve support for UTF-8 JSON bodies sent without a JSON Content-Type.
const readDraftBody = express.raw({ type: () => true, limit: '6mb', inflate: false });

draftsRouter.head('/drafts', (_request, response) => {
  response.status(404).json({ error: 'Not found' });
});
draftsRouter.get('/drafts', async (_request, response) => {
  response.json(await listDrafts());
});
draftsRouter.get('/drafts/:id/image', async (request, response) => {
  if (!isValidId(request.params.id)) {
    response.status(400).json({ error: 'Invalid draft ID' });
    return;
  }
  const image = await getDraftImage(request.params.id);
  if (!image) {
    response.status(404).json({ error: 'Image not found' });
    return;
  }
  response.set('Cache-Control', 'no-store').type(image.type).send(image.data);
});
draftsRouter.post('/drafts', readDraftBody, saveDraft, handleDraftBodyError);
draftsRouter.put('/drafts/:id', readDraftBody, saveDraft, handleDraftBodyError);
draftsRouter.delete('/drafts/:id', async (request, response) => {
  if (!isValidId(request.params.id)) {
    response.status(400).json({ error: 'Invalid draft ID' });
    return;
  }
  if (!await deleteDraft(request.params.id)) {
    response.status(404).json({ error: 'Draft not found' });
    return;
  }
  response.status(204).end();
});
