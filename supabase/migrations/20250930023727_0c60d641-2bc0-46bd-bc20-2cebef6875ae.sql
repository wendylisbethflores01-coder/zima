-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'agent', 'user');

-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Create agent_invitations table
CREATE TABLE public.agent_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on agent_invitations
ALTER TABLE public.agent_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for agent_invitations
CREATE POLICY "Authenticated users can view invitations" 
ON public.agent_invitations 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create invitations" 
ON public.agent_invitations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update invitations" 
ON public.agent_invitations 
FOR UPDATE 
USING (true);

-- Modify agents table to add user_id and invitation_status
ALTER TABLE public.agents 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'expired'));

-- Create function to handle new user registration
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

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to assign agent role
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

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = _role
  );
$$;

-- Add trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on agent_invitations  
CREATE TRIGGER update_agent_invitations_updated_at
  BEFORE UPDATE ON public.agent_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();