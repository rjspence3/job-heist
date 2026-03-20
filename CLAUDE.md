# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product Context

AI Job Heist Planner — a comedic AI tool that interviews users about their job, then generates a personalized "Heist Plan" showing how AI would replace them. Comedy is the Trojan horse for a genuine AI opportunity audit.

- **Tone:** Deadpan heist movie meets corporate satire (Ocean's Eleven meets Office Space)
- **Format:** Conversational AI interview (5-7 questions) → generated Heist Plan report
- **Core insight:** Users who would never do a serious "AI readiness assessment" will do this for fun

## Architecture

This is a stateless Next.js app with two-phase AI interaction:

### Phase 1: Interview
Conversational chat UI where the AI plays a "heist planner" casing the user's job. Extracts structured data: tasks, tools, time allocation, decision types.

### Phase 2: Report Generation
Four-section Heist Plan generated from interview data:
- **Target Profile** — Intelligence dossier summary of the user's role
- **Heist Plan** — Step-by-step AI takeover plan, specific to user's actual tasks
- **Threat Level** — Percentage breakdown by task category (data entry, communication, analysis, creative, relationship management)
- **What AI Can't Steal** — Genuinely human elements (the emotional payoff)

### Serious Mode Toggle
Same data reframed constructively: heist steps become opportunities, threat level becomes leverage score, adds a priority matrix.

### AI Backend
Claude API with two core prompts:
1. **Interview prompt** — Persona-driven conversation with structured data extraction
2. **Report prompt** — Generates both comedic and serious versions from structured interview data

### Key Design Constraints
- Stateless MVP (no user accounts, no saved reports)
- Claude API calls must be server-side (API route) to protect the key
- Threat Level scoring needs a deterministic rubric, not LLM-improvised percentages
- Share mechanic is screenshot-oriented (no reconstructable URLs in v1)

## Commands

```bash
npm run dev              # Start dev server (port 3003)
npm run build            # Production build
npm run lint             # ESLint
```

## Tech Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS for styling
- Claude API (Anthropic SDK) for AI interactions
- Vercel for deployment
