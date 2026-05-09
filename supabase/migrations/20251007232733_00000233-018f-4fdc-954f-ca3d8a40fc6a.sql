-- Add whatsapp column to agents table
ALTER TABLE public.agents 
ADD COLUMN whatsapp text;

-- Set default value to phone for existing agents
UPDATE public.agents 
SET whatsapp = phone 
WHERE whatsapp IS NULL AND phone IS NOT NULL;