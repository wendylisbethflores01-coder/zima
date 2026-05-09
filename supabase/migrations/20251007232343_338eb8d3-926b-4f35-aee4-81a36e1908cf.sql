-- Allow agents to update their own information
CREATE POLICY "Agents can update their own information"
ON public.agents
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());