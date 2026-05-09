-- Drop existing materialized view and related objects if they exist
DROP MATERIALIZED VIEW IF EXISTS public.property_locations CASCADE;
DROP TRIGGER IF EXISTS refresh_locations_on_property_change ON public.properties;
DROP FUNCTION IF EXISTS public.trigger_refresh_property_locations();
DROP FUNCTION IF EXISTS public.refresh_property_locations();

-- Create a simple view for property locations
CREATE OR REPLACE VIEW public.property_locations AS
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

-- Grant permissions for the view
GRANT SELECT ON public.property_locations TO anon;
GRANT SELECT ON public.property_locations TO authenticated;