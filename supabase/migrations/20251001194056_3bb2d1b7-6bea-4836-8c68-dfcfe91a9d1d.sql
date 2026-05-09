-- Create enum for contract status
CREATE TYPE contract_status AS ENUM ('active', 'expired', 'terminated');

-- Create rental_contracts table
CREATE TABLE public.rental_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  tenant_name TEXT NOT NULL,
  tenant_email TEXT,
  tenant_phone TEXT,
  monthly_rent_pen NUMERIC(10, 2),
  monthly_rent_usd NUMERIC(10, 2),
  contract_start_date DATE NOT NULL,
  contract_end_date DATE NOT NULL,
  deposit_amount_pen NUMERIC(10, 2),
  deposit_amount_usd NUMERIC(10, 2),
  contract_status contract_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rental_contracts
CREATE POLICY "Agents can view their own rental contracts"
ON public.rental_contracts
FOR SELECT
USING (
  agent_id IN (
    SELECT id FROM public.agents WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Agents can create rental contracts for their properties"
ON public.rental_contracts
FOR INSERT
WITH CHECK (
  agent_id IN (
    SELECT id FROM public.agents WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all rental contracts"
ON public.rental_contracts
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create any rental contract"
ON public.rental_contracts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rental_contracts_updated_at
BEFORE UPDATE ON public.rental_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_rental_contracts_property_id ON public.rental_contracts(property_id);
CREATE INDEX idx_rental_contracts_agent_id ON public.rental_contracts(agent_id);
CREATE INDEX idx_rental_contracts_status ON public.rental_contracts(contract_status);
CREATE INDEX idx_rental_contracts_dates ON public.rental_contracts(contract_start_date, contract_end_date);