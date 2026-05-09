-- Create sales table to track property sales
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  sale_price_pen NUMERIC(12, 2),
  sale_price_usd NUMERIC(12, 2),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Agents can view their own sales
CREATE POLICY "Agents can view their own sales"
ON public.sales
FOR SELECT
USING (agent_id IN (
  SELECT id FROM public.agents WHERE user_id = auth.uid()
));

-- Agents can create sales for their properties
CREATE POLICY "Agents can create sales for their properties"
ON public.sales
FOR INSERT
WITH CHECK (agent_id IN (
  SELECT id FROM public.agents WHERE user_id = auth.uid()
));

-- Admins can view all sales
CREATE POLICY "Admins can view all sales"
ON public.sales
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can create any sale
CREATE POLICY "Admins can create any sale"
ON public.sales
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_sales_updated_at
BEFORE UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_sales_agent_id ON public.sales(agent_id);
CREATE INDEX idx_sales_property_id ON public.sales(property_id);
CREATE INDEX idx_sales_sale_date ON public.sales(sale_date);