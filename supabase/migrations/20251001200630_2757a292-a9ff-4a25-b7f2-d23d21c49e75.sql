-- Add policy for agents to view all their properties regardless of status
CREATE POLICY "Agents can view all their properties"
ON public.properties
FOR SELECT
TO authenticated
USING (
  agent_id IN (
    SELECT id 
    FROM public.agents 
    WHERE user_id = auth.uid()
  )
);