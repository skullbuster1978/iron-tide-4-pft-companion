-- IRON TIDE 4 — Supabase setup.
-- Run this once in your Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It creates the `progress` table that stores each user's checkmarks, training
-- numbers, and settings as JSONB, keyed by their auth user id. Row Level
-- Security makes sure users can only ever read/write their own row.

create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

drop policy if exists "Users can read their own progress" on public.progress;
create policy "Users can read their own progress"
  on public.progress for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own progress" on public.progress;
create policy "Users can insert their own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own progress" on public.progress;
create policy "Users can update their own progress"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
