-- Remove is_featured column from properties table
ALTER TABLE public.properties DROP COLUMN IF EXISTS is_featured;

-- Add is_approved column to properties table
ALTER TABLE public.properties ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT true;