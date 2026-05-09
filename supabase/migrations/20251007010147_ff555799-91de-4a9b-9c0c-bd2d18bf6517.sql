-- Remove avatar_url column from agents table since avatars are now loaded from storage
ALTER TABLE public.agents DROP COLUMN avatar_url;