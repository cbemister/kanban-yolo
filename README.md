# Kanban Project Manager

A full-stack Kanban-style project management app built with Next.js 15.

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS v4, @dnd-kit
- **Auth:** NextAuth v5 (credentials + Google OAuth)
- **Database:** Prisma 6 + Neon PostgreSQL
- **State:** @tanstack/react-query v5
- **Real-time:** Pusher (presence channels)
- **Email:** Resend

## Features

- Drag-and-drop cards across columns
- Multi-board support per user
- Card labels, assignees, and due dates
- Board sharing and invitations by email
- Real-time collaboration via Pusher
- Search and filter cards by label, assignee, or due date

## Getting Started

```bash
cd frontend
npm install
cp .env.example .env  # fill in your credentials
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo account: `demo@kanban.dev` / `password123`.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth secret (generate with `npx auth secret`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth (optional) |
| `RESEND_API_KEY` | Resend API key for invitation emails |
| `NEXT_PUBLIC_APP_URL` | App base URL |
| `PUSHER_APP_ID` / `PUSHER_SECRET` | Pusher server credentials |
| `NEXT_PUBLIC_PUSHER_KEY` / `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher client credentials |

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm test             # Unit tests
npx playwright test  # Integration tests
```
