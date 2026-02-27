# Environment Variables

All vars go in `frontend/.env.local` (gitignored). Run `cd frontend` before starting the dev server.

## Database

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | yes | Neon PostgreSQL connection string |

## Auth (NextAuth v5)

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | yes | JWT signing secret — run `npx auth secret` to generate |
| `AUTH_GOOGLE_ID` | optional | Google OAuth client ID (enables Google sign-in) |
| `AUTH_GOOGLE_SECRET` | optional | Google OAuth client secret |

## App

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | yes | Public base URL, e.g. `http://localhost:3000`. Used to build invitation email links. |

## Pusher (real-time)

| Variable | Required | Description |
|----------|----------|-------------|
| `PUSHER_APP_ID` | yes | Server-only app ID |
| `PUSHER_SECRET` | yes | Server-only secret |
| `NEXT_PUBLIC_PUSHER_KEY` | yes | Client-side publishable key |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | yes | Cluster region, e.g. `us2` |

## Resend (email)

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | yes | API key from resend.com — used by `lib/email.ts` |

## Stripe (billing)

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | yes | Secret key from Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | yes | Webhook signing secret (`whsec_...`) — from Stripe dashboard or `stripe listen` CLI |
| `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID` | yes | Stripe price ID for monthly pro plan |
| `NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID` | yes | Stripe price ID for yearly pro plan |

## S3 (file attachments)

| Variable | Required | Description |
|----------|----------|-------------|
| `S3_ACCESS_KEY_ID` | yes | AWS access key (or R2 equivalent) |
| `S3_SECRET_ACCESS_KEY` | yes | AWS secret key |
| `S3_BUCKET` | yes | Bucket name (default: `kanban-attachments`) |
| `S3_REGION` | yes | Region, e.g. `us-east-1` |
| `S3_PUBLIC_URL` | optional | CDN or public base URL for serving files. If absent, falls back to `https://{bucket}.s3.amazonaws.com` |
| `S3_ENDPOINT` | optional | Custom endpoint for R2 / MinIO compatible storage |

## Inngest (background jobs)

| Variable | Required | Description |
|----------|----------|-------------|
| `INNGEST_EVENT_KEY` | prod only | Event key for sending events to Inngest cloud |
| `INNGEST_SIGNING_KEY` | prod only | Signing key for verifying Inngest webhook requests |

Inngest works without these vars in local dev — the Dev Server (`npx inngest-cli@latest dev`) handles it automatically.

## Notes

- Prefix `NEXT_PUBLIC_` variables are embedded in the client bundle at build time — never put secrets in them.
- For local Stripe webhook testing: `stripe listen --forward-to localhost:3000/api/billing/webhook` — this outputs the `STRIPE_WEBHOOK_SECRET` to use.
- Demo seed credentials: `demo@kanban.dev` / `password123` (created by `npx prisma db seed`).
