-- 1. Support for Contextual Turn Types (CRITICAL for filters)
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS tipo text; 
-- (This ensures turns like 'carrito' are saved even if the site is 'fijo')

-- 2. Support for Territory Notes
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS territorios text;

-- 3. Support for Site Categories
ALTER TABLE sitios ADD COLUMN IF NOT EXISTS event_type text;

-- 4. Support for Captain Assignment
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS capitan_id uuid references auth.users(id);

-- 4. Notifications Table (Fixes 404 Error)
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

-- 5. Enable RLS for Notifications
alter table public.notificaciones enable row level security;

create policy "Users can view their own notifications"
  on public.notificaciones for select
  using (auth.uid() = user_id);

create policy "Admins can insert notifications"
  on public.notificaciones for insert
  with check (true);
