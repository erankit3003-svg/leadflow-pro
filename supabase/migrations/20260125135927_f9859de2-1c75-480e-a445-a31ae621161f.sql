-- Fix company creation for non-super-admin users by ensuring policies are PERMISSIVE

-- 1) Companies: make the super-admin ALL policy permissive (it currently blocks inserts when restrictive)
DROP POLICY IF EXISTS "Super admins can manage all companies" ON public.companies;
CREATE POLICY "Super admins can manage all companies"
ON public.companies
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- 2) Tenant memberships: make the super-admin and tenant-admin ALL policies permissive
DROP POLICY IF EXISTS "Super admins can manage all memberships" ON public.tenant_memberships;
CREATE POLICY "Super admins can manage all memberships"
ON public.tenant_memberships
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Tenant admins can manage memberships" ON public.tenant_memberships;
CREATE POLICY "Tenant admins can manage memberships"
ON public.tenant_memberships
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.is_tenant_admin(auth.uid(), company_id))
WITH CHECK (public.is_tenant_admin(auth.uid(), company_id));

-- 3) Allow a company creator to create the first membership row for themselves (admin)
-- This enables onboarding: create company -> insert membership -> company becomes visible via SELECT policy
DROP POLICY IF EXISTS "Company creators can create initial membership" ON public.tenant_memberships;
CREATE POLICY "Company creators can create initial membership"
ON public.tenant_memberships
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.companies c
    WHERE c.id = company_id
      AND c.created_by = auth.uid()
  )
);
