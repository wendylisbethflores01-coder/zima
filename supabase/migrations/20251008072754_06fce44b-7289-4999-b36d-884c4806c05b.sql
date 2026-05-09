-- Drop the restrictive policy that only shows active properties
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;

-- Create new policies: one for public users (only active) and one for authenticated users (all)
CREATE POLICY "Public can view active properties" 
ON public.properties 
FOR SELECT 
TO anon
USING (is_active = true);

CREATE POLICY "Authenticated can view all properties" 
ON public.properties 
FOR SELECT 
TO authenticated
USING (true);