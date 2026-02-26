# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Full-stack Kanban SaaS app. Multi-board, drag-and-drop cards, collaboration with labels/assignees/due dates, board sharing, real-time sync via Pusher.

All application code lives in the `frontend/` subdirectory (Next.js 15).

Detailed references:
- @frontend/CLAUDE-schema.md — database models and migration notes
- @frontend/CLAUDE-api.md — API route inventory
- @frontend/CLAUDE-frontend.md — components, hooks, pages, and key patterns

## Tech Stack

- Next.js 15 + TypeScript + Tailwind CSS v4
- NextAuth v5 beta (JWT sessions, Credentials + Google)
- Prisma 6 + Neon PostgreSQL
- @tanstack/react-query v5 + react-hot-toast + zod
- @dnd-kit (drag-and-drop)
- Pusher + pusher-js (real-time)
- Resend (email)
- date-fns + react-day-picker

## Common Commands

```bash
cd frontend
npm install
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Unit tests
npx playwright test  # Integration tests
npx prisma migrate dev --name <name>  # New migration
npx prisma db seed   # Seed demo data (demo@kanban.dev / password123)
```

## Color Scheme

| Token            | Hex       | Usage                          |
|------------------|-----------|--------------------------------|
| Accent Yellow    | `#ecad0a` | Accent lines, highlights       |
| Blue Primary     | `#209dd7` | Links, key sections            |
| Purple Secondary | `#753991` | Submit buttons, important actions |
| Dark Navy        | `#032147` | Main headings, board background |
| Gray Text        | `#888888` | Supporting text, labels        |

## Coding Standards

- Keep it simple. Never over-engineer. No unnecessary defensive programming.
- No extra features beyond what is specified.
- Use latest library versions and idiomatic patterns.
- No emojis in code or documentation.
- Keep README minimal.
- All API routes use `checkBoardPermission` from `src/lib/permissions.ts` for auth.
- Broadcasts to Pusher via `broadcastToBoard` after all mutating API calls.
