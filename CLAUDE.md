# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kanban-style project management web app (MVP). Single board with 5 renamable columns, cards with title/details, drag-and-drop between columns. No persistence, no user management, no archive/search/filter. Opens with dummy data.

The full business and technical requirements are in `AGENTS.md`.

## Tech Stack

- Next.js (client-rendered), located in `frontend/` subdirectory
- No backend/database -- all state is client-side

## Common Commands

Once the `frontend/` app is scaffolded:

```bash
cd frontend
npm install
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm test             # Unit tests (Jest/Vitest)
npx playwright test  # Integration tests
```

## Color Scheme

| Token            | Hex       | Usage                          |
|------------------|-----------|--------------------------------|
| Accent Yellow    | `#ecad0a` | Accent lines, highlights       |
| Blue Primary     | `#209dd7` | Links, key sections            |
| Purple Secondary | `#753991` | Submit buttons, important actions |
| Dark Navy        | `#032147` | Main headings                  |
| Gray Text        | `#888888` | Supporting text, labels        |

## Coding Standards

- Keep it simple. Never over-engineer. No unnecessary defensive programming.
- No extra features beyond what is specified.
- Use latest library versions and idiomatic patterns.
- No emojis in code or documentation.
- Keep README minimal.
