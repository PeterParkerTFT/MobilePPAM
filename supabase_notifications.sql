-- Create notificaciones table if it doesn't exist to fix 404 errors
create table if not exists public.notificaciones (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  titulo text not null,
  mensaje text not null,
  leido boolean default false,
  tipo text default 'info'::text,
  metadata jsonb default '{}'::jsonb
);

-- Enable RLS
alter table public.notificaciones enable row level security;

-- Policies
create policy "Users can view their own notifications"
  on public.notificaciones for select
  using (auth.uid() = user_id);

create policy "Admins can insert notifications"
  on public.notificaciones for insert
  with check (true);
