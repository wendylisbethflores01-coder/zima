-- Add age column to properties table
ALTER TABLE public.properties 
ADD COLUMN age INTEGER;

COMMENT ON COLUMN public.properties.age IS 'Property age in years';