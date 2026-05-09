-- Add construction/premiere date column to properties table
ALTER TABLE public.properties 
ADD COLUMN construction_date DATE;

-- Add comment to explain the column
COMMENT ON COLUMN public.properties.construction_date IS 'Date when the property was built/constructed. Can be null for land/terrain properties.';