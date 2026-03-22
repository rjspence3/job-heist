# jobheist

An AI-powered career vulnerability analyzer built with Next.js and Claude. You complete a short interview about your job, and it generates a "heist briefing" — a stylized report assessing how much of your work AI could plausibly automate, and what it can't touch.

**Live demo:** https://jobheist.vercel.app

## What it does

1. **Interview** — Claude conducts a 5-7 turn conversation about your daily tasks, tools, and work context.
2. **Report** — Claude generates a structured heist-themed analysis including a threat level score, a phase-by-phase "heist plan" for AI automation, and a breakdown of your uniquely human strengths.
3. **Share** — Reports are encoded into a shareable URL (no database required).

## Tech stack

- **Next.js 15** (App Router, standalone output)
- **Anthropic Claude** via `@anthropic-ai/sdk` — Haiku for the interview (low latency), Sonnet for report generation (higher quality structured output)
- **Zod** — runtime validation on all API inputs and Claude outputs
- **TypeScript**, Tailwind CSS

## Architecture

Two separate Claude model calls handle the two phases:

- **Chat** (`/api/chat`) — Uses Claude Haiku for fast, conversational responses during the interview. Rate-limited to 20 requests/minute per IP. The route detects when the interview is complete and embeds structured interview data in a sentinel-delimited block in the final message.
- **Report** (`/api/report`) — Uses Claude Sonnet to generate the full heist briefing from the completed interview transcript. Output is validated against a Zod schema and encoded into a shareable URL parameter — no database or storage layer required.
- **Health** (`/api/health`) — Returns `{ status: "ok" }`. Used by the Docker health check.
- **Beta** (`/api/beta`) — Optional beta gate. Validates a code and sets a signed HMAC cookie.

## Running locally

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your values (see Environment variables below)

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `CLAUDE_MODEL` | No | Model for interview chat (default: `claude-haiku-4-5-20251001`) |
| `CLAUDE_REPORT_MODEL` | No | Model for report generation (default: `claude-sonnet-4-5-20251001`) |
| `BETA_CODE` | No | Optional beta gate code |
| `BETA_SECRET` | No | HMAC secret for signing the beta cookie |

## Running tests

```bash
npm test
```

63 tests across 8 test files covering API routes, Claude client, schemas, rate limiter, scoring, and URL encoding.

## Docker

```bash
docker build -t jobheist .
docker run -p 3000:3000 --env-file .env.local jobheist
```
