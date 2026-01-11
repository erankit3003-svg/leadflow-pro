-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy: Users can view profiles of users in their tenant
CREATE POLICY "Users can view tenant member profiles"
ON public.profiles
FOR SELECT
USING (
  user_id IN (
    SELECT tm.user_id 
    FROM public.tenant_memberships tm
    WHERE tm.company_id IN (SELECT get_user_tenant_ids(auth.uid()))
      AND tm.is_active = true
  )
);

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
USING (is_super_admin(auth.uid()));