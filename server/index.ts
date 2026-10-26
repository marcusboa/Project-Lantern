import { existsSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import { basicAuth } from './auth';
import { createCardApi } from './cardApi';
import { openCardStore, resolveDataDir } from './cardStore';

/** Production entry point: serves the built app from `dist/` plus the card API on one port. */
const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? '127.0.0.1';
const user = process.env.LANTERN_USER || 'lantern';
const password = process.env.LANTERN_PASSWORD ?? '';
const trustProxy = process.env.TRUST_PROXY ?? '';
const distDir = path.resolve('dist');
const dataDir = resolveDataDir();
const MIN_PASSWORD_LENGTH = 12;

const loopback = ['127.0.0.1', 'localhost', '::1'].includes(host);
if (!loopback && password.length < MIN_PASSWORD_LENGTH) {
  console.error(
    `Refusing to listen on ${host}: set LANTERN_PASSWORD (at least ${MIN_PASSWORD_LENGTH} characters) ` +
      'so only you can open the site and edit cards.',
  );
  process.exit(1);
}

if (!existsSync(path.join(distDir, 'index.html'))) {
  console.warn('dist/ has no build yet — run `npm run build` first; only the API will respond.');
}

const app = express();
app.disable('x-powered-by');
if (trustProxy !== '') app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);

app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow',
  });
  next();
});
app.get('/healthz', (_req, res) => {
  res.type('text').send('ok');
});
if (password !== '') app.use(basicAuth(user, password));
app.use('/api', createCardApi(openCardStore(dataDir)));
app.use(express.static(distDir));

app.listen(port, host, () => {
  const access = password !== '' ? `password-protected (user "${user}")` : 'no password';
  console.log(`Patent Infotainment Device on http://${host}:${port} — ${access}, cards in ${dataDir}`);
});
