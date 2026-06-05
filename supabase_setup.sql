-- Run this entire script in your Supabase SQL Editor
-- Go to: https://supabase.com → Your Project → SQL Editor → New Query

-- ─────────────────────────────────────────
-- 1. TASKS TABLE
-- ─────────────────────────────────────────
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'To do',
  priority text not null default 'Normal',
  assignee text,
  due_date date,
  created_at timestamptz default now()
);

-- Enable anyone with the link to read/write tasks
alter table tasks enable row level security;
create policy "Public access" on tasks for all using (true) with check (true);

-- ─────────────────────────────────────────
-- 2. EVENTS TABLE (calendar dates)
-- ─────────────────────────────────────────
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  type text not null default 'other',
  notes text,
  created_at timestamptz default now()
);

alter table events enable row level security;
create policy "Public access" on events for all using (true) with check (true);

-- ─────────────────────────────────────────
-- 3. FILES TABLE (file + link metadata)
-- ─────────────────────────────────────────
create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  size bigint,
  url text,
  storage_path text,
  created_at timestamptz default now()
);

alter table files enable row level security;
create policy "Public access" on files for all using (true) with check (true);

-- ─────────────────────────────────────────
-- 4. STORAGE BUCKET for file uploads
-- ─────────────────────────────────────────
-- Run this separately in the Supabase Dashboard:
-- Storage → New Bucket → Name: "project-files" → Public: ON
-- Then add these storage policies:

insert into storage.buckets (id, name, public) values ('project-files', 'project-files', true)
on conflict (id) do nothing;

create policy "Public upload" on storage.objects for insert with check (bucket_id = 'project-files');
create policy "Public read" on storage.objects for select using (bucket_id = 'project-files');
create policy "Public delete" on storage.objects for delete using (bucket_id = 'project-files');

-- ─────────────────────────────────────────
-- Done! Run this, then follow SETUP_GUIDE.md
-- ─────────────────────────────────────────
