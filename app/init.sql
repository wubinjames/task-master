create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  completed boolean not null default false,
  priority text not null check (priority in ('low', 'medium', 'high')),
  category text not null,
  created_at timestamptz not null default now(),
  due_date timestamptz,
  attachments text[]
);

alter table public.todos enable row level security;

create policy "Allow logged-in users to read their todos"
on public.todos
for select
using (auth.uid() = user_id);

create policy "Allow logged-in users to insert their todos"
on public.todos
for insert
with check (auth.uid() = user_id);

create policy "Allow logged-in users to update their todos"
on public.todos
for update
using (auth.uid() = user_id);

create policy "Allow logged-in users to delete their todos"
on public.todos
for delete
using (auth.uid() = user_id);