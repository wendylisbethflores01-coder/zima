-- Remove additional_images and is_recent columns from properties table
ALTER TABLE public.properties DROP COLUMN IF EXISTS additional_images;
ALTER TABLE public.properties DROP COLUMN IF EXISTS is_recent;