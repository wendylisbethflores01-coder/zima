-- Fix security definer functions by adding proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_agent_role(_user_id UUID, _agent_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update profile role to agent
  UPDATE public.profiles 
  SET role = 'agent', updated_at = now()
  WHERE id = _user_id;
  
  -- Link agent to user
  UPDATE public.agents 
  SET user_id = _user_id, invitation_status = 'accepted', updated_at = now()
  WHERE id = _agent_id;
  
  -- Mark invitation as accepted
  UPDATE public.agent_invitations 
  SET status = 'accepted', updated_at = now()
  WHERE agent_id = _agent_id AND status = 'pending';
  
  RETURN TRUE;
END;
$$;