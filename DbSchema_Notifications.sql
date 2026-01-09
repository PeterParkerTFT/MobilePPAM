-- Notifications Table
create table if not exists notificaciones (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  titulo text not null,
  mensaje text not null,
  tipo text default 'info', -- 'info', 'success', 'warning', 'error'
  leido boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table notificaciones enable row level security;

-- Policies
create policy "Users can view own notifications" on notificaciones
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on notificaciones
  for update using (auth.uid() = user_id);

-- Only system/functions (or potentially admins) insert notifications usually, 
-- but for MVP we might allow captains to 'send' notifications implicitly via triggers or service calls.
-- Letting authenticated users insert for now (e.g. to simulate sending one to themselves or others if logic permits)
create policy "Users can insert notifications" on notificaciones
  for insert with check (true); 
