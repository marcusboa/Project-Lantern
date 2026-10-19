import express, { type ErrorRequestHandler } from 'express';
import { CARD_ID_PATTERN, parseCard } from '../src/studio/cardSchema';
import type { CardStore } from './cardStore';

/**
 * JSON API for Studio cards, meant to be mounted at `/api`:
 *   GET    /cards        list stored cards (oldest first)
 *   PUT    /cards/:id    create or replace a card; inline bitmaps are stored as files
 *   DELETE /cards/:id    remove a card and its stored bitmap
 *   GET    /images/:file stored bitmaps
 */
export function createCardApi(store: CardStore): express.Express {
  const api = express();
  api.disable('x-powered-by');
  api.use(express.json({ limit: '8mb' }));

  api.get('/cards', (_req, res) => {
    res.json(store.list());
  });

  api.put('/cards/:id', (req, res) => {
    const card = parseCard(req.body);
    if (card === null) {
      res.status(400).json({ error: 'A card needs a valid id and a title.' });
      return;
    }
    if (card.id !== req.params.id) {
      res.status(400).json({ error: 'The card id does not match the URL.' });
      return;
    }
    res.json(store.save(card));
  });

  api.delete('/cards/:id', (req, res) => {
    if (!CARD_ID_PATTERN.test(req.params.id)) {
      res.status(400).json({ error: 'Invalid card id.' });
      return;
    }
    store.remove(req.params.id);
    res.status(204).end();
  });

  api.use('/images', express.static(store.imagesDir, { immutable: true, maxAge: '365d' }));

  const handleError: ErrorRequestHandler = (error, _req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    const tooLarge = isRecord(error) && error.type === 'entity.too.large';
    if (!tooLarge) console.error(error);
    res
      .status(tooLarge ? 413 : 500)
      .json({ error: tooLarge ? 'That card is too large to save.' : 'The card server failed to save.' });
  };
  api.use(handleError);

  return api;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
