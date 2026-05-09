-- Remove image_url column from properties table since images are now in storage
ALTER TABLE public.properties DROP COLUMN image_url;