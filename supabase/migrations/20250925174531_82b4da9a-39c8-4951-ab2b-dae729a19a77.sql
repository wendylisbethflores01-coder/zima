-- Create enum for property types
CREATE TYPE public.property_type AS ENUM ('Casa', 'Departamento', 'Terreno', 'Oficina', 'Local');

-- Create enum for transaction types  
CREATE TYPE public.transaction_type AS ENUM ('venta', 'alquiler', 'anticresis');

-- Create agents table
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  property_type public.property_type NOT NULL,
  transaction_type public.transaction_type NOT NULL DEFAULT 'venta',
  price_pen DECIMAL(12,2) NOT NULL,
  price_usd DECIMAL(12,2) NOT NULL,
  
  -- Location fields
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  province TEXT,
  full_location TEXT NOT NULL,
  
  -- Property details
  area DECIMAL(8,2) NOT NULL, -- Total area in m²
  built_area DECIMAL(8,2), -- Built area in m²
  bedrooms INTEGER,
  bathrooms INTEGER,
  parking INTEGER,
  
  -- Media
  image_url TEXT NOT NULL,
  additional_images TEXT[], -- Array of additional image URLs
  
  -- Agent reference
  agent_id UUID REFERENCES public.agents(id),
  
  -- Status and metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_recent BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (properties are public)
CREATE POLICY "Anyone can view active properties" 
ON public.properties 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Anyone can view agents" 
ON public.agents 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_properties_type ON public.properties(property_type);
CREATE INDEX idx_properties_transaction ON public.properties(transaction_type);
CREATE INDEX idx_properties_location ON public.properties(city, district);
CREATE INDEX idx_properties_price_pen ON public.properties(price_pen);
CREATE INDEX idx_properties_price_usd ON public.properties(price_usd);
CREATE INDEX idx_properties_area ON public.properties(area);
CREATE INDEX idx_properties_bedrooms ON public.properties(bedrooms);
CREATE INDEX idx_properties_bathrooms ON public.properties(bathrooms);
CREATE INDEX idx_properties_active ON public.properties(is_active);
CREATE INDEX idx_properties_recent ON public.properties(is_recent);
CREATE INDEX idx_properties_created ON public.properties(created_at);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample agents
INSERT INTO public.agents (name, avatar_url) VALUES
('Ana García', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'),
('Carlos Mendoza', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'),
('María López', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'),
('José Rodríguez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jose'),
('Patricia Silva', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia'),
('Roberto Vega', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto'),
('Luis Mendoza', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luis'),
('Carmen Flores', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carmen');

-- Insert sample properties with proper agent references
INSERT INTO public.properties (
  property_code, title, property_type, transaction_type, price_pen, price_usd,
  city, district, province, full_location, area, built_area, bedrooms, bathrooms, parking,
  image_url, agent_id, is_recent
) VALUES
('1152523', 'Casa en Venta San Blas Cusco', 'Casa', 'venta', 1179720.00, 339000.00,
 'Cusco', 'San Blas', 'Cusco', 'Cusco, Cusco, Cusco', 188.00, 200.00, 3, 2, 2,
 '/src/assets/house-modern.jpg', (SELECT id FROM public.agents WHERE name = 'Ana García' LIMIT 1), true),

('1088329', 'Departamento Flat en Venta Miraflores', 'Departamento', 'venta', 807008.00, 231899.00,
 'Lima', 'Miraflores', 'Lima', 'Lima, Lima, Miraflores', 82.52, 82.52, 2, 2, 0,
 '/src/assets/apartment-luxury.jpg', (SELECT id FROM public.agents WHERE name = 'Carlos Mendoza' LIMIT 1), true),

('1120463', 'Terreno en Venta Breña', 'Terreno', 'venta', 1461600.00, 420000.00,
 'Lima', 'Breña', 'Lima', 'Lima, Lima, Breña', 337.00, NULL, NULL, NULL, 0,
 '/src/assets/terrain-lot.jpg', (SELECT id FROM public.agents WHERE name = 'María López' LIMIT 1), false),

('1154372', 'Departamento Flat en Venta Santiago de Surco', 'Departamento', 'venta', 968055.00, 278177.00,
 'Lima', 'Santiago de Surco', 'Lima', 'Lima, Lima, Santiago de Surco', 122.80, 155.00, 2, 2, 0,
 '/src/assets/commercial-building.jpg', (SELECT id FROM public.agents WHERE name = 'José Rodríguez' LIMIT 1), false),

('1151372', 'Casa Moderna en San Isidro', 'Casa', 'venta', 2350000.00, 675000.00,
 'Lima', 'San Isidro', 'Lima', 'Lima, Lima, San Isidro', 350.00, 420.00, 4, 3, 3,
 '/src/assets/house-modern.jpg', (SELECT id FROM public.agents WHERE name = 'Patricia Silva' LIMIT 1), true),

('1135663', 'Oficina Comercial Miraflores', 'Oficina', 'venta', 1850000.00, 531000.00,
 'Lima', 'Miraflores', 'Lima', 'Lima, Lima, Miraflores', 145.00, 145.00, NULL, NULL, 0,
 '/src/assets/commercial-building.jpg', (SELECT id FROM public.agents WHERE name = 'Roberto Vega' LIMIT 1), false),

('1156789', 'Casa Familiar en Ate', 'Casa', 'venta', 850000.00, 244000.00,
 'Lima', 'Ate', 'Lima', 'Lima, Lima, Ate', 120.00, 95.00, 3, 2, 1,
 '/src/assets/house-modern.jpg', (SELECT id FROM public.agents WHERE name = 'Luis Mendoza' LIMIT 1), false),

('1157890', 'Departamento en Surquillo', 'Departamento', 'venta', 520000.00, 149000.00,
 'Lima', 'Surquillo', 'Lima', 'Lima, Lima, Surquillo', 65.00, 65.00, 2, 1, 0,
 '/src/assets/apartment-luxury.jpg', (SELECT id FROM public.agents WHERE name = 'Carmen Flores' LIMIT 1), false);