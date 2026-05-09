-- Create table for property change requests (hybrid approach)
CREATE TABLE property_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  requested_by_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Estado del ticket
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Campos clave tipados (más frecuentemente modificados)
  proposed_title TEXT,
  proposed_description TEXT,
  proposed_property_type property_type,
  proposed_transaction_type transaction_type,
  proposed_price NUMERIC(12, 2),
  proposed_currency currency,
  proposed_city TEXT,
  proposed_district TEXT,
  proposed_province TEXT,
  proposed_area NUMERIC(8, 2),
  proposed_built_area NUMERIC(8, 2),
  proposed_bedrooms INTEGER,
  proposed_bathrooms INTEGER,
  proposed_parking INTEGER,
  proposed_age INTEGER,
  
  -- Otros cambios en JSONB (campos menos comunes)
  other_changes JSONB DEFAULT '{}'::jsonb,
  
  -- Imágenes y amenidades propuestas
  proposed_images JSONB DEFAULT '[]'::jsonb,
  proposed_amenities JSONB DEFAULT '[]'::jsonb,
  
  -- Snapshot original para auditoría
  original_snapshot JSONB NOT NULL,
  
  -- Notas
  request_notes TEXT,
  admin_notes TEXT,
  
  -- Revisión
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_change_requests_status ON property_change_requests(status);
CREATE INDEX idx_change_requests_property ON property_change_requests(property_id);
CREATE INDEX idx_change_requests_agent ON property_change_requests(requested_by_agent_id);
CREATE INDEX idx_change_requests_created ON property_change_requests(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_property_change_requests_updated_at
  BEFORE UPDATE ON property_change_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE property_change_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Agents can view their own change requests"
ON property_change_requests FOR SELECT
USING (
  requested_by_agent_id IN (
    SELECT id FROM agents WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Agents can create change requests"
ON property_change_requests FOR INSERT
WITH CHECK (
  requested_by_agent_id IN (
    SELECT id FROM agents WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all change requests"
ON property_change_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update change requests"
ON property_change_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete change requests"
ON property_change_requests FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Función para aplicar cambios aprobados
CREATE OR REPLACE FUNCTION apply_approved_property_changes(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
BEGIN
  -- Obtener el ticket aprobado
  SELECT * INTO v_request
  FROM property_change_requests
  WHERE id = request_id AND status = 'approved';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket no encontrado o no aprobado';
  END IF;
  
  -- Aplicar cambios a la propiedad
  UPDATE properties
  SET
    title = COALESCE(v_request.proposed_title, title),
    description = COALESCE(v_request.proposed_description, description),
    property_type = COALESCE(v_request.proposed_property_type, property_type),
    transaction_type = COALESCE(v_request.proposed_transaction_type, transaction_type),
    price = COALESCE(v_request.proposed_price, price),
    currency = COALESCE(v_request.proposed_currency, currency),
    city = COALESCE(v_request.proposed_city, city),
    district = COALESCE(v_request.proposed_district, district),
    province = COALESCE(v_request.proposed_province, province),
    area = COALESCE(v_request.proposed_area, area),
    built_area = COALESCE(v_request.proposed_built_area, built_area),
    bedrooms = COALESCE(v_request.proposed_bedrooms, bedrooms),
    bathrooms = COALESCE(v_request.proposed_bathrooms, bathrooms),
    parking = COALESCE(v_request.proposed_parking, parking),
    age = COALESCE(v_request.proposed_age, age),
    updated_at = NOW()
  WHERE id = v_request.property_id;
  
  -- Si hay amenidades propuestas, actualizarlas
  IF v_request.proposed_amenities IS NOT NULL AND jsonb_array_length(v_request.proposed_amenities) > 0 THEN
    -- Eliminar amenidades actuales
    DELETE FROM property_amenities WHERE property_id = v_request.property_id;
    
    -- Insertar nuevas amenidades
    INSERT INTO property_amenities (property_id, amenity_id)
    SELECT v_request.property_id, (elem->>'id')::uuid
    FROM jsonb_array_elements(v_request.proposed_amenities) elem;
  END IF;
  
  RETURN TRUE;
END;
$$;