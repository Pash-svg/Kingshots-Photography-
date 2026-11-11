-- Run this entire file in Supabase Dashboard > SQL Editor > New query.
-- It creates tables, signup profile trigger, and Row Level Security policies.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  district text not null default 'Kabale',
  interest text not null default 'Digital skills',
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text not null default 'Uganda',
  job_type text not null default 'Job' check (job_type in ('Job','Internship','Freelance','Volunteer')),
  description text not null,
  apply_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  district text not null default 'Kabale',
  email text not null,
  description text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(job_id,user_id)
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
 insert into public.profiles(id,full_name,district,interest)
 values (
  new.id,
  coalesce(new.raw_user_meta_data->>'full_name',''),
  coalesce(new.raw_user_meta_data->>'district','Kabale'),
  coalesce(new.raw_user_meta_data->>'interest','Digital skills')
 )
 on conflict (id) do nothing;
 return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin'); $$;

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.businesses enable row level security;
alter table public.applications enable row level security;

drop policy if exists "profile self read" on public.profiles;
create policy "profile self read" on public.profiles for select to authenticated using (id=auth.uid() or public.is_admin());
drop policy if exists "profile self update" on public.profiles;
create policy "profile self update" on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid() and role='user');

drop policy if exists "public active jobs read" on public.jobs;
create policy "public active jobs read" on public.jobs for select to anon,authenticated using (is_active=true or public.is_admin());
drop policy if exists "admin jobs insert" on public.jobs;
create policy "admin jobs insert" on public.jobs for insert to authenticated with check (public.is_admin());
drop policy if exists "admin jobs update" on public.jobs;
create policy "admin jobs update" on public.jobs for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin jobs delete" on public.jobs;
create policy "admin jobs delete" on public.jobs for delete to authenticated using (public.is_admin());

drop policy if exists "approved businesses public read" on public.businesses;
create policy "approved businesses public read" on public.businesses for select to anon,authenticated using (is_approved=true or owner_id=auth.uid() or public.is_admin());
drop policy if exists "owner submit business" on public.businesses;
create policy "owner submit business" on public.businesses for insert to authenticated with check (owner_id=auth.uid() and is_approved=false);
drop policy if exists "admin business update" on public.businesses;
create policy "admin business update" on public.businesses for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin business delete" on public.businesses;
create policy "admin business delete" on public.businesses for delete to authenticated using (public.is_admin());

drop policy if exists "user read own applications" on public.applications;
create policy "user read own applications" on public.applications for select to authenticated using (user_id=auth.uid() or public.is_admin());
drop policy if exists "user apply as self" on public.applications;
create policy "user apply as self" on public.applications for insert to authenticated with check (user_id=auth.uid());

-- After you create your own account, make yourself admin by running:
-- UPDATE public.profiles SET role='admin' WHERE id='YOUR_AUTH_USER_UUID';
-- Get your UUID from Supabase Dashboard > Authentication > Users.
-- Never expose admin status or service-role credentials in frontend JavaScript.
