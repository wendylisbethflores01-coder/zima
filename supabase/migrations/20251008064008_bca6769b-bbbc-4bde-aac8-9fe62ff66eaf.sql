-- Create property_types table
CREATE TABLE public.property_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;

-- Create policies for property_types
CREATE POLICY "Anyone can view active property types"
ON public.property_types
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin can insert property types"
ON public.property_types
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update property types"
ON public.property_types
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete property types"
ON public.property_types
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_property_types_updated_at
BEFORE UPDATE ON public.property_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default property types
INSERT INTO public.property_types (name) VALUES
  ('Departamento'),
  ('Casa'),
  ('Terreno'),
  ('Local Comercial'),
  ('Oficina');