-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;

-- Create a new INSERT policy that allows:
-- 1. Users creating companies for themselves (created_by = auth.uid())
-- 2. Super admins can create companies for anyone
CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);