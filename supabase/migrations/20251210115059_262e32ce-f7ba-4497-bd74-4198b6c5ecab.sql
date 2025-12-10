-- Create school_invitations table for pending invitations
CREATE TABLE public.school_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(school_id, email)
);

-- Enable RLS
ALTER TABLE public.school_invitations ENABLE ROW LEVEL SECURITY;

-- Admins can manage invitations
CREATE POLICY "Admins can view invitations"
ON public.school_invitations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert invitations"
ON public.school_invitations
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete invitations"
ON public.school_invitations
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to auto-accept invitations when user signs up
CREATE OR REPLACE FUNCTION public.accept_pending_invitations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Find pending invitations for this email and create user_school associations
  INSERT INTO public.user_schools (user_id, school_id, role, is_primary)
  SELECT NEW.id, school_id, role, false
  FROM public.school_invitations
  WHERE email = NEW.email;
  
  -- Delete the processed invitations
  DELETE FROM public.school_invitations WHERE email = NEW.email;
  
  RETURN NEW;
END;
$$;

-- Trigger to run after profile is created (which happens after user signs up)
CREATE TRIGGER on_profile_created_accept_invitations
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.accept_pending_invitations();