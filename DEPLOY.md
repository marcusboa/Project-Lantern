# Deploying Project Lantern as a private website

This puts the archive viewer and Studio on your own web address, behind a password. Cards you
make in Studio are saved on the server, so every browser you sign in from sees the same cards.

## What you need

- **A Linux server** (any VPS such as DigitalOcean, Hetzner, Linode or AWS Lightsail; 1 GB RAM
  is plenty) with [Docker](https://docs.docker.com/engine/install/) installed.
- **A web address** (e.g. `lantern.yourdomain.com`) with a DNS **A record** pointing at the
  server's IP address. Set this up first; the HTTPS certificate is issued only once the address
  reaches the server.
- Ports **80** and **443** open on the server's firewall.

## First-time setup

On the server:

```bash
git clone https://github.com/marcusboa/Project-Lantern.git
cd Project-Lantern
cp .env.example .env
nano .env          # set LANTERN_DOMAIN and a long LANTERN_PASSWORD
docker compose up -d --build
```

Open `https://<your address>`. The browser asks for a name and password: use `LANTERN_USER`
(default `lantern`) and `LANTERN_PASSWORD` from `.env`.

What runs:

| Service | Job |
| --- | --- |
| `lantern` | The app, Studio and card API (port 8787, not exposed directly) |
| `caddy` | Gets and renews the HTTPS certificate and forwards traffic to `lantern` |

## Day-to-day

| Task | Command (run in the `Project-Lantern` folder) |
| --- | --- |
| Update to the latest `main` | `git pull && docker compose up -d --build` |
| Change the password | edit `.env`, then `docker compose up -d` |
| Check it's running | `docker compose ps` and `docker compose logs -f lantern` |
| Stop / start | `docker compose down` / `docker compose up -d` |

Updating or restarting keeps your cards: they live in the `lantern-data` Docker volume, not in
the container.

## Backups

Cards (`lantern.db`) and uploaded diagrams (`images/`) are in the `lantern-data` volume. To save
a dated backup into the current folder (the site pauses for a few seconds so the database is
copied in a consistent state):

```bash
docker compose stop lantern
docker compose run --rm --no-deps -v "$PWD:/backup" --entrypoint tar lantern \
  czf /backup/lantern-backup-$(date +%F).tgz -C /data .
docker compose start lantern
```

Copy the `.tgz` file somewhere off the server (e.g. `scp` it to your computer).

To restore one (this replaces the cards on the server):

```bash
docker compose stop lantern
docker compose run --rm --no-deps -v "$PWD:/backup" --entrypoint sh lantern \
  -c 'rm -rf /data/* && tar xzf /backup/lantern-backup-YYYY-MM-DD.tgz -C /data'
docker compose start lantern
```

## Security notes

- The whole site needs the password, including the archive viewer, Studio, the card API and
  uploaded images. Only `/healthz` (which just answers `ok`) is public.
- After 10 wrong passwords from one address, sign-in is blocked for 15 minutes.
- The server refuses to start on a public address without a password of at least 12
  characters.
- Pages are marked `noindex`, so search engines won't list the site.
- There is one shared login. Anyone with it can add, edit and delete cards.

## Other hosting options

- **Hosts that run a Dockerfile** (Render, Fly.io, Railway and similar): deploy the `Dockerfile`
  on its own (skip `docker-compose.yml` and Caddy; the host provides HTTPS). Set the
  `LANTERN_PASSWORD` environment variable and attach a **persistent disk at `/data`**. Without
  that disk, cards are lost on every redeploy.
- **Without Docker:** install Node 22.12+, then `npm ci && npm run build`, and run
  `HOST=0.0.0.0 LANTERN_PASSWORD=... npm start` under a process manager (systemd, pm2). Put it
  behind an HTTPS reverse proxy (Caddy or nginx), because the password is only safe over HTTPS.
  Set `TRUST_PROXY=1` when behind a proxy so sign-in limits apply per visitor.
