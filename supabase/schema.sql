-- ==============================================================================
-- MD (MYDREAM) BIRTHDAY SANCTUARY - SUPABASE SCHEMA & SECURITY POLICIES
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text default 'visitor', -- 'owner', 'vijeta', 'visitor'
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. MEDIA ALBUMS
create table if not exists public.memory_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. MEDIA (Photos & Videos)
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  caption text,
  media_type text not null check (media_type in ('image', 'video')),
  file_url text not null,
  storage_path text not null,
  bucket_id text default 'md-gallery',
  category text default 'gallery',
  album_id uuid references public.memory_albums(id) on delete set null,
  event_date text,
  rotation numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete set null
);

-- 4. MD'S FAVOURITE MEMORIES
create table if not exists public.favourite_memories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  memory_date text,
  media_urls text[] default array[]::text[],
  video_url text,
  is_favourite boolean default true,
  tags text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete set null
);

-- 5. QUESTIONS & ANSWERS
create table if not exists public.questions (
  id text primary key,
  type text not null check (type in ('text', 'choice', 'reflection')),
  prompt text not null,
  subtitle text,
  options jsonb,
  placeholder text,
  order_index integer default 0
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id text references public.questions(id) on delete cascade,
  answer_text text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade
);

-- 6. PRIVATE DIARY ENTRIES
create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  mood text default 'loved' check (mood in ('happy', 'loved', 'peaceful', 'reflective', 'dreamy')),
  entry_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.memory_albums enable row level security;
alter table public.media enable row level security;
alter table public.favourite_memories enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.diary_entries enable row level security;

-- Profiles: Users can view their own profile, admins/owners can view all
create policy "Allow logged in users to read profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Allow users to update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Media Albums: Public can view, authenticated can insert/update/delete
create policy "Allow public view on memory albums"
  on public.memory_albums for select
  using (true);

create policy "Allow authenticated users to manage albums"
  on public.memory_albums for all
  using (auth.role() = 'authenticated');

-- Media: Public can view gallery media, authenticated can insert/update/delete
create policy "Allow public view on media"
  on public.media for select
  using (true);

create policy "Allow authenticated users to insert media"
  on public.media for insert
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to update media"
  on public.media for update
  using (auth.role() = 'authenticated');

create policy "Allow authenticated users to delete media"
  on public.media for delete
  using (auth.role() = 'authenticated');

-- Favourite Memories: Public can view, authenticated can manage
create policy "Allow public view on favourite memories"
  on public.favourite_memories for select
  using (true);

create policy "Allow authenticated users to insert favourite memories"
  on public.favourite_memories for insert
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to update favourite memories"
  on public.favourite_memories for update
  using (auth.role() = 'authenticated');

create policy "Allow authenticated users to delete favourite memories"
  on public.favourite_memories for delete
  using (auth.role() = 'authenticated');

-- Questions: Public can read questions
create policy "Allow public view on questions"
  on public.questions for select
  using (true);

create policy "Allow authenticated users to manage questions"
  on public.questions for all
  using (auth.role() = 'authenticated');

-- Answers: Authenticated users can view and save answers
create policy "Allow authenticated users to view answers"
  on public.answers for select
  using (auth.role() = 'authenticated');

create policy "Allow authenticated users to insert or update answers"
  on public.answers for all
  using (auth.role() = 'authenticated');

-- Diary: STRICT PRIVACY - ONLY authenticated users (Vijeta/Owner)
create policy "Allow only authenticated users to view diary entries"
  on public.diary_entries for select
  using (auth.role() = 'authenticated');

create policy "Allow only authenticated users to insert diary entries"
  on public.diary_entries for insert
  with check (auth.role() = 'authenticated');

create policy "Allow only authenticated users to update diary entries"
  on public.diary_entries for update
  using (auth.role() = 'authenticated');

create policy "Allow only authenticated users to delete diary entries"
  on public.diary_entries for delete
  using (auth.role() = 'authenticated');

-- ==============================================================================
-- STORAGE BUCKETS SETUP: md-gallery, md-videos, md-favourite-memories
-- ==============================================================================
insert into storage.buckets (id, name, public)
values 
  ('md-gallery', 'md-gallery', true),
  ('md-videos', 'md-videos', true),
  ('md-favourite-memories', 'md-favourite-memories', true)
on conflict (id) do update set public = true;

-- Storage Policies for md-gallery
create policy "Public Access to md-gallery"
  on storage.objects for select
  using (bucket_id = 'md-gallery');

create policy "Authenticated Users can upload to md-gallery"
  on storage.objects for insert
  with check (bucket_id = 'md-gallery' and auth.role() = 'authenticated');

create policy "Authenticated Users can delete from md-gallery"
  on storage.objects for delete
  using (bucket_id = 'md-gallery' and auth.role() = 'authenticated');

-- Storage Policies for md-videos
create policy "Public Access to md-videos"
  on storage.objects for select
  using (bucket_id = 'md-videos');

create policy "Authenticated Users can upload to md-videos"
  on storage.objects for insert
  with check (bucket_id = 'md-videos' and auth.role() = 'authenticated');

create policy "Authenticated Users can delete from md-videos"
  on storage.objects for delete
  using (bucket_id = 'md-videos' and auth.role() = 'authenticated');

-- Storage Policies for md-favourite-memories
create policy "Public Access to md-favourite-memories"
  on storage.objects for select
  using (bucket_id = 'md-favourite-memories');

create policy "Authenticated Users can upload to md-favourite-memories"
  on storage.objects for insert
  with check (bucket_id = 'md-favourite-memories' and auth.role() = 'authenticated');

create policy "Authenticated Users can delete from md-favourite-memories"
  on storage.objects for delete
  using (bucket_id = 'md-favourite-memories' and auth.role() = 'authenticated');
