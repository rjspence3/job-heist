# jobheist

An AI-powered career vulnerability analyzer built with Next.js and Claude. You complete a short interview about your job, and it generates a "heist briefing" — a stylized report assessing how much of your work AI could plausibly automate, and what it can't touch.

**Live demo:** https://jobheist.vercel.app

## What it does

1. **Interview** — Claude conducts a 5-7 turn conversation about your daily tasks, tools, and work context.
2. **Report** — Claude generates a structured heist-themed analysis including a threat level score, a phase-by-phase "heist plan" for AI automation, and a breakdown of your uniquely human strengths.
3. **Share** — Reports are encoded into a shareable URL (no database required).

## Tech stack

- **Next.js 15** (App Router, standalone output)
- **Anthropic Claude** via `@anthropic-ai/sdk` — both interview chat and report generation
- **Zod** — runtime validation on all API inputs and Claude outputs
- **TypeScript**, Tailwind CSS

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

## Docker

```bash
docker build -t jobheist .
docker run -p 3000:3000 --env-file .env.local jobheist
```
