create extension if not exists "pgcrypto";

create type transaction_type as enum ('BUY', 'SELL');

create table if not exists portfolios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  base_currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references portfolios(id) on delete cascade,
  symbol text not null,
  company_name text,
  sector text not null default 'Unclassified',
  type transaction_type not null,
  quantity numeric(18, 6) not null check (quantity > 0),
  price numeric(18, 6) not null check (price >= 0),
  fees numeric(18, 6) not null default 0 check (fees >= 0),
  executed_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_portfolio_symbol_idx
  on transactions(portfolio_id, symbol);

create index if not exists transactions_portfolio_executed_at_idx
  on transactions(portfolio_id, executed_at);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists portfolios_set_updated_at on portfolios;
create trigger portfolios_set_updated_at
before update on portfolios
for each row execute function set_updated_at();

drop trigger if exists transactions_set_updated_at on transactions;
create trigger transactions_set_updated_at
before update on transactions
for each row execute function set_updated_at();

alter table portfolios enable row level security;
alter table transactions enable row level security;

-- Service-role API access is expected through FastAPI. Add user-scoped RLS
-- policies here when authentication is introduced in a later phase.
