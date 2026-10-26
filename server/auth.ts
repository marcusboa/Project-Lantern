import { createHash, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';

const MAX_FAILURES = 10;
const LOCKOUT_MS = 15 * 60 * 1000;
const MAX_TRACKED_CLIENTS = 10_000;

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

/**
 * HTTP Basic authentication for the whole site (app, card API and images). After
 * `MAX_FAILURES` wrong passwords a client is locked out for `LOCKOUT_MS`.
 * Only safe behind HTTPS, which the Caddy proxy in docker-compose.yml provides.
 */
export function basicAuth(user: string, password: string): RequestHandler {
  const expected = digest(`${user}:${password}`);
  const failures = new Map<string, { count: number; resetAt: number }>();

  return (req, res, next) => {
    const client = req.ip ?? 'unknown';
    const now = Date.now();
    let entry = failures.get(client);
    if (entry !== undefined && entry.resetAt <= now) {
      failures.delete(client);
      entry = undefined;
    }
    if (entry !== undefined && entry.count >= MAX_FAILURES) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      res.status(429).type('text').send('Too many failed sign-in attempts. Try again later.');
      return;
    }

    const [scheme, encoded] = (req.get('authorization') ?? '').split(' ');
    if (scheme?.toLowerCase() === 'basic' && encoded) {
      const supplied = digest(Buffer.from(encoded, 'base64').toString('utf8'));
      if (timingSafeEqual(supplied, expected)) {
        failures.delete(client);
        next();
        return;
      }
      if (failures.size >= MAX_TRACKED_CLIENTS) failures.clear();
      failures.set(client, {
        count: (entry?.count ?? 0) + 1,
        resetAt: entry?.resetAt ?? now + LOCKOUT_MS,
      });
    }

    res.set('WWW-Authenticate', 'Basic realm="Project Lantern", charset="UTF-8"');
    res.status(401).type('text').send('Sign in to view Project Lantern.');
  };
}
