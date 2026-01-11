-- Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Revoke all access from anon role explicitly
REVOKE ALL ON public.profiles FROM anon;

-- Grant access only to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;