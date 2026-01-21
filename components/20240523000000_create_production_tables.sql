-- Create projects table
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  owner_id uuid references auth.users(id) default auth.uid(),
  deleted_at timestamptz,
  created_at timestamptz default now()
);

-- Create scripts table
create table if not exists scripts (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  title text,
  version text,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create scenes table
create table if not exists scenes (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  scene_number text,
  heading text,
  location jsonb,
  time text,
  summary text,
  content text,
  script text,
  technical jsonb,
  creative jsonb,
  logistics jsonb,
  audio jsonb,
  shot_list jsonb,
  metadata jsonb,
  ai_history jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create characters table
create table if not exists characters (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  name text,
  role text,
  description text,
  photo text,
  actor_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create contacts table
create table if not exists contacts (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  type text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Create locations table
create table if not exists locations (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  setting text,
  description text,
  permit_status text,
  address text,
  images text[],
  availability jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Create notes table
create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  title text,
  content text,
  type text,
  priority text,
  tags text[],
  mentions text[],
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create events table (Schedule)
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  start_time timestamptz,
  end_time timestamptz,
  all_day boolean default false,
  event_type text,
  location_id uuid references locations(id) on delete set null,
  description text,
  cast_members text[],
  created_at timestamptz default now()
);

-- Create expenses table (Budget)
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  item text not null,
  category text,
  amount numeric,
  status text,
  created_at timestamptz default now()
);

-- Create continuity_sheets table
create table if not exists continuity_sheets (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade unique,
  date date,
  first_take_time time,
  pack_up_time time,
  rows jsonb default '[]'::jsonb,
  content jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create files table
create table if not exists files (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  url text not null,
  type text,
  size bigint,
  folder text,
  uploaded_at timestamptz default now()
);

-- Create shot_plans table
create table if not exists shot_plans (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  project_name text,
  scene_text text,
  director_notes text,
  shot_list text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table projects enable row level security;
alter table scripts enable row level security;
alter table scenes enable row level security;
alter table characters enable row level security;
alter table shot_plans enable row level security;
alter table contacts enable row level security;
alter table locations enable row level security;
alter table notes enable row level security;
alter table events enable row level security;
alter table expenses enable row level security;
alter table continuity_sheets enable row level security;
alter table files enable row level security;

-- Policies

-- Projects: Enable all access for development (since no auth is implemented yet)
drop policy if exists "Users can manage their own projects" on projects;
create policy "Enable all access for projects" on projects
  for all using (true) with check (true);

-- Scripts
drop policy if exists "Users can manage scripts in their projects" on scripts;
create policy "Enable all access for scripts" on scripts
  for all using (true) with check (true);

-- Scenes
drop policy if exists "Users can manage scenes in their projects" on scenes;
create policy "Enable all access for scenes" on scenes
  for all using (true) with check (true);

-- Characters
drop policy if exists "Users can manage characters in their projects" on characters;
create policy "Enable all access for characters" on characters
  for all using (true) with check (true);

-- Shot Plans
drop policy if exists "Users can manage shot plans in their projects" on shot_plans;
create policy "Enable all access for shot_plans" on shot_plans
  for all using (true) with check (true);

-- Contacts
drop policy if exists "Users can manage contacts in their projects" on contacts;
create policy "Enable all access for contacts" on contacts
  for all using (true) with check (true);

-- Locations
drop policy if exists "Users can manage locations in their projects" on locations;
create policy "Enable all access for locations" on locations
  for all using (true) with check (true);

-- Notes
drop policy if exists "Users can manage notes in their projects" on notes;
create policy "Enable all access for notes" on notes
  for all using (true) with check (true);

-- Events
drop policy if exists "Users can manage events in their projects" on events;
create policy "Enable all access for events" on events
  for all using (true) with check (true);

-- Expenses
drop policy if exists "Users can manage expenses in their projects" on expenses;
create policy "Enable all access for expenses" on expenses
  for all using (true) with check (true);

-- Continuity Sheets
drop policy if exists "Users can manage continuity_sheets in their projects" on continuity_sheets;
create policy "Enable all access for continuity_sheets" on continuity_sheets
  for all using (true) with check (true);

-- Files
drop policy if exists "Users can manage files in their projects" on files;
create policy "Enable all access for files" on files
  for all using (true) with check (true);

-- Function to automatically update updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for scripts table
drop trigger if exists on_scripts_update on public.scripts;
create trigger on_scripts_update
  before update on public.scripts
  for each row
  execute procedure public.handle_updated_at();

-- Trigger for scenes table
drop trigger if exists on_scenes_update on public.scenes;
create trigger on_scenes_update
  before update on public.scenes
  for each row
  execute procedure public.handle_updated_at();

-- Trigger for characters table
drop trigger if exists on_characters_update on public.characters;
create trigger on_characters_update
  before update on public.characters
  for each row
  execute procedure public.handle_updated_at();

-- Trigger for shot_plans table
drop trigger if exists on_shot_plans_update on public.shot_plans;
create trigger on_shot_plans_update
  before update on public.shot_plans
  for each row
  execute procedure public.handle_updated_at();

-- Ensure columns exist if table was created previously without them
alter table public.scenes add column if not exists script text;
alter table public.scenes add column if not exists shot_list jsonb;
alter table public.scenes add column if not exists ai_history jsonb;

-- Ensure deleted_at exists on projects if table was created before this column was added
alter table public.projects add column if not exists deleted_at timestamptz;

-- STORAGE SETUP
-- Create the storage bucket for character photos
insert into storage.buckets (id, name, public)
values ('character-photos', 'character-photos', true)
on conflict (id) do nothing;

-- Policies for storage
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'character-photos' );

drop policy if exists "Authenticated users can upload" on storage.objects;
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'character-photos'
    and auth.role() = 'authenticated'
  );

drop policy if exists "Users can update own uploads" on storage.objects;
create policy "Users can update own uploads"
  on storage.objects for update
  using (
    bucket_id = 'character-photos'
    and auth.uid() = owner
  );

drop policy if exists "Users can delete own uploads" on storage.objects;
create policy "Users can delete own uploads"
  on storage.objects for delete
  using (
    bucket_id = 'character-photos'
    and auth.uid() = owner
  );

-- Reload schema cache
notify pgrst, 'reload config';