-- Run this in Supabase SQL Editor to fix the "Could not find column in schema cache" error

-- 1. Ensure the column exists
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- 2. Force PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload config';