create table if not exists public.schemas (
  user_id uuid primary key references auth.users (id) on delete cascade,
  content text not null,
  format text not null check (format in ('json', 'yaml')),
  updated_at timestamptz not null default now()
);

alter table public.schemas enable row level security;

create policy "Users can read own schema"
on public.schemas
for select
using (auth.uid() = user_id);

create policy "Users can insert own schema"
on public.schemas
for insert
with check (auth.uid() = user_id);

create policy "Users can update own schema"
on public.schemas
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
