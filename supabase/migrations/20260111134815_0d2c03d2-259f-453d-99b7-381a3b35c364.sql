-- Fix profiles table: Ensure only authenticated users can access
-- Drop existing SELECT policies to recreate with proper restrictions
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view tenant member profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;

-- Recreate with explicit authenticated role requirement
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view tenant member profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT tm.user_id 
    FROM public.tenant_memberships tm
    WHERE tm.company_id IN (SELECT get_user_tenant_ids(auth.uid()))
      AND tm.is_active = true
  )
);

CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));

-- Fix leads table: Ensure only authenticated users can access
DROP POLICY IF EXISTS "Users can view tenant leads" ON public.leads;

CREATE POLICY "Users can view tenant leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  (tenant_id IN (SELECT get_user_tenant_ids(auth.uid()))) 
  OR is_super_admin(auth.uid())
);