-- Run this in Supabase SQL Editor to create the missing storage bucket

-- 1. Create the storage bucket for character photos
insert into storage.buckets (id, name, public)
values ('character-photos', 'character-photos', true)
on conflict (id) do nothing;

-- 2. Set up access policies for the storage bucket

-- Allow public access to view photos
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'character-photos' );

-- Allow authenticated users to upload photos
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'character-photos'
    and auth.role() = 'authenticated'
  );

-- Allow users to update their own uploads
create policy "Users can update own uploads"
  on storage.objects for update
  using (
    bucket_id = 'character-photos'
    and auth.uid() = owner
  );

-- Allow users to delete their own uploads
create policy "Users can delete own uploads"
  on storage.objects for delete
  using (
    bucket_id = 'character-photos'
    and auth.uid() = owner
  );