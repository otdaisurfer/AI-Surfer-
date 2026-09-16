# Wave Check HubSpot Retry Worker

## One-time secret setup

Run locally from an authenticated Wrangler session:

```bash
npx wrangler@4.112.0 secret put HUBSPOT_ACCESS_TOKEN --config wrangler.wave-check-retry.jsonc
```

Paste the existing HubSpot private-app access token when Wrangler prompts. Never place the token in the repository, shell history, screenshots, or documentation.

## Deploy

```bash
npm run worker:retry:deploy
```

## Verify

Confirm in Cloudflare that Worker `ai-surfer-wave-check-retry` has:

- D1 binding `OTDAISURFER`
- secret `HUBSPOT_ACCESS_TOKEN`
- Cron Trigger `*/5 * * * *`
- observability enabled

A successful source merge does not prove these runtime settings are active.
