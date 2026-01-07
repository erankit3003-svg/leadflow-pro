-- Update the Admins can manage roles policy to include super_admin
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Super admin can view all companies (not just their tenants)
DROP POLICY IF EXISTS "Users can view their tenant companies" ON public.companies;
CREATE POLICY "Users can view their tenant companies" 
ON public.companies 
FOR SELECT 
USING (
  id IN (SELECT get_user_tenant_ids(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Super admin can manage all companies
DROP POLICY IF EXISTS "Super admins can manage all companies" ON public.companies;
CREATE POLICY "Super admins can manage all companies"
ON public.companies
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Super admin can view all tenant memberships
DROP POLICY IF EXISTS "Super admins can view all memberships" ON public.tenant_memberships;
CREATE POLICY "Super admins can view all memberships"
ON public.tenant_memberships
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Super admin can manage all tenant memberships
DROP POLICY IF EXISTS "Super admins can manage all memberships" ON public.tenant_memberships;
CREATE POLICY "Super admins can manage all memberships"
ON public.tenant_memberships
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Super admin can view all leads
DROP POLICY IF EXISTS "Users can view tenant leads" ON public.leads;
CREATE POLICY "Users can view tenant leads" 
ON public.leads 
FOR SELECT 
USING (
  tenant_id IN (SELECT get_user_tenant_ids(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Super admin can manage all leads
DROP POLICY IF EXISTS "Super admins can manage all leads" ON public.leads;
CREATE POLICY "Super admins can manage all leads"
ON public.leads
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Super admin can view all lead notes
DROP POLICY IF EXISTS "Users can view tenant lead notes" ON public.lead_notes;
CREATE POLICY "Users can view tenant lead notes" 
ON public.lead_notes 
FOR SELECT 
USING (
  tenant_id IN (SELECT get_user_tenant_ids(auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Super admin can manage all lead notes
DROP POLICY IF EXISTS "Super admins can manage all lead notes" ON public.lead_notes;
CREATE POLICY "Super admins can manage all lead notes"
ON public.lead_notes
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create is_super_admin helper function
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;