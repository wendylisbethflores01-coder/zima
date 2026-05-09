-- Create materialized view for unique property locations
CREATE MATERIALIZED VIEW public.property_locations AS
SELECT DISTINCT 
  CONCAT(province, ', ', city, ', ', district) as location_formatted,
  province,
  city, 
  district,
  COUNT(*) as property_count
FROM public.properties 
WHERE is_active = true 
  AND province IS NOT NULL 
  AND city IS NOT NULL 
  AND district IS NOT NULL
GROUP BY province, city, district
ORDER BY province, city, district;

-- Create unique index on district for better performance
CREATE UNIQUE INDEX idx_property_locations_district ON public.property_locations (district);

-- Create index on the formatted location for search purposes
CREATE INDEX idx_property_locations_formatted ON public.property_locations (location_formatted);

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_property_locations()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.property_locations;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically refresh the view when properties are updated
CREATE OR REPLACE FUNCTION trigger_refresh_property_locations()
RETURNS trigger AS $$
BEGIN
  PERFORM refresh_property_locations();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_locations_on_property_change
  AFTER INSERT OR UPDATE OR DELETE ON public.properties
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_property_locations();