create table if not exists public.stylink_users (
  id bigserial primary key,
  type text not null check (type in ('client', 'business')),
  name text not null,
  contact_name text,
  email text not null unique,
  password text not null,
  city text,
  role text,
  bio text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Allow public read/write (our functions handle auth logic)
alter table public.stylink_users enable row level security;

create policy "Allow all" on public.stylink_users
  for all using (true) with check (true);
