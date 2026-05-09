-- Remove construction_date column from properties table
ALTER TABLE public.properties 
DROP COLUMN construction_date;