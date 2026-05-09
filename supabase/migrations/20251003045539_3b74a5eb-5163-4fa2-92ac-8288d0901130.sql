-- Create unique index to prevent multiple active rental contracts for the same property
CREATE UNIQUE INDEX unique_active_rental_per_property 
ON rental_contracts (property_id) 
WHERE contract_status = 'active';

-- Add comment to document the constraint
COMMENT ON INDEX unique_active_rental_per_property IS 'Ensures only one active rental contract exists per property at a time';