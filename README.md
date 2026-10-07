# Koovis PA — Web Frontend

Next.js 15 web client for Koovis PA. Deployed to `pa.koovis.ai` via Vercel. Connects to the backend API at `api.koovis.ai` (FastAPI running on EC2, source in the private ops repo).

## Status

**Live.** Production web client for Koovis PA.

This repo is **frontend only**. The PA backend — chat engine, agent orchestrator, MCP server, Telegram bot, SQLite DB, 13 MCP tools — lives in the private ops repo.

## Architecture

```
┌─────────────────────┐       ┌──────────────────────┐       ┌──────────┐
│ koovis-pa-web (this) │  →→→  │ ops backend (EC2)    │  →→→  │ koovis.db│
│ Next.js 15 · Vercel │ HTTPS │ FastAPI · bot · MCP  │       │ SQLite   │
│ pa.koovis.ai        │       │ api.koovis.ai        │       │ + S3     │
└─────────────────────┘       └──────────────────────┘       └──────────┘
```

## Canonical Docs

| To understand | Read |
|---|---|
| **What Koovis PA is** (product, positioning, GTM) | ops repo: `docs/archive/workforce/PA_PRODUCT_SPEC.md` |
| **What we're building now** (MVP, architecture, week-by-week) | ops repo: `docs/koovis/workforce/BLUEPRINT.md` |
| **Why we decided X** | ops repo: `docs/archive/workforce/DECISIONS.md` |
| **Where to start** | ops repo: `docs/archive/workforce/README.md` |
| **Frontend internals** (this repo) | `CLAUDE.md` |

## Local Dev

```bash
npm install
npm run dev     # localhost:3000
npm run build
npm run start
```

Backend API base: `https://api.koovis.ai/api`

---

*Koovis AI — Koovis PA*
