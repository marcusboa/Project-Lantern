import { existsSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import { createCardApi } from './cardApi';
import { openCardStore, resolveDataDir } from './cardStore';

/** Production entry point: serves the built app from `dist/` plus the card API on one port. */
const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? '127.0.0.1';
const distDir = path.resolve('dist');
const dataDir = resolveDataDir();

if (!existsSync(path.join(distDir, 'index.html'))) {
  console.warn('dist/ has no build yet — run `npm run build` first; only the API will respond.');
}

const app = express();
app.disable('x-powered-by');
app.use('/api', createCardApi(openCardStore(dataDir)));
app.use(express.static(distDir));

app.listen(port, host, () => {
  console.log(`Patent Infotainment Device on http://${host}:${port} — cards in ${dataDir}`);
});
