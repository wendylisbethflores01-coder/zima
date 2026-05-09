-- Create amenities table
CREATE TABLE public.amenities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property_amenities pivot table
CREATE TABLE public.property_amenities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, amenity_id)
);

-- Enable RLS
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;

-- Create policies for amenities (public read access)
CREATE POLICY "Anyone can view active amenities" 
ON public.amenities 
FOR SELECT 
USING (is_active = true);

-- Create policies for property_amenities (public read access)
CREATE POLICY "Anyone can view property amenities" 
ON public.property_amenities 
FOR SELECT 
USING (true);

-- Add trigger for amenities updated_at
CREATE TRIGGER update_amenities_updated_at
BEFORE UPDATE ON public.amenities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some common amenities
INSERT INTO public.amenities (name, icon, category) VALUES
('Piscina', 'Waves', 'recreational'),
('Gimnasio', 'Dumbbell', 'fitness'),
('Estacionamiento', 'Car', 'parking'),
('Jardín', 'Trees', 'outdoor'),
('Balcón', 'Home', 'outdoor'),
('Aire acondicionado', 'Snowflake', 'climate'),
('Calefacción', 'Flame', 'climate'),
('Lavandería', 'Shirt', 'utility'),
('Ascensor', 'ArrowUp', 'accessibility'),
('Seguridad 24/7', 'Shield', 'security'),
('Internet', 'Wifi', 'connectivity'),
('Cable/TV', 'Tv', 'entertainment'),
('Cocina equipada', 'ChefHat', 'kitchen'),
('Terraza', 'Mountain', 'outdoor'),
('Chimenea', 'Flame', 'comfort');