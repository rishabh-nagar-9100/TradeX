# TradeX Phase 2: Portfolio Management

Phase 2 adds portfolio infrastructure only. It does not implement AI prediction, trade recommendations, or sentiment features.

## Scope

- Portfolio CRUD
- Buy/sell transaction capture
- Holdings engine
- Portfolio analytics
- Sector allocation visualization
- Performance visualization
- FastAPI endpoints for portfolio operations
- Supabase/Postgres schema and Prisma schema

## Frontend

The current app remains a Vite/React dashboard for backward compatibility. Portfolio logic is isolated under:

- `src/features/portfolio/portfolioEngine.ts`
- `src/features/portfolio/portfolioRepository.ts`
- `src/components/portfolio/`

The repository currently uses `localStorage` so the dashboard works without requiring Supabase credentials. It can be swapped for API calls to the FastAPI routes without changing the analytics engine.

## Backend

FastAPI files live under `backend/app`.

Endpoints:

- `GET /api/v1/portfolio`
- `POST /api/v1/portfolio`
- `GET /api/v1/portfolio/{portfolio_id}`
- `PATCH /api/v1/portfolio/{portfolio_id}`
- `DELETE /api/v1/portfolio/{portfolio_id}`
- `GET /api/v1/portfolio/{portfolio_id}/transactions`
- `POST /api/v1/portfolio/{portfolio_id}/transactions`
- `POST /api/v1/portfolio/{portfolio_id}/analytics`

## Database

Supabase SQL schema:

- `backend/supabase/portfolio_schema.sql`

Prisma schema:

- `backend/prisma/schema.prisma`

Use `DATABASE_URL` from Supabase. Do not commit real keys or connection strings.

## Local API Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## Production Notes

- Replace the development repository adapter in `backend/app/repositories/portfolio_repository.py` with a Prisma-backed adapter before production.
- Keep portfolio calculations in service/engine modules, not route handlers or UI components.
- Add authenticated user ownership and row-level security policies in a later auth phase.
