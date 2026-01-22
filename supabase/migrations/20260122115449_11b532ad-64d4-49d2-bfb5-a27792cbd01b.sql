-- Drop the existing SELECT policy for leads
DROP POLICY IF EXISTS "Users can view tenant leads" ON public.leads;

-- Create a new SELECT policy that restricts visibility:
-- 1. Super admins can see all leads
-- 2. Tenant admins can see all leads in their tenant
-- 3. Regular users (sales executives) can only see leads assigned to them or created by them
CREATE POLICY "Users can view tenant leads" 
ON public.leads 
FOR SELECT 
USING (
  -- Super admins see everything
  is_super_admin(auth.uid())
  OR
  -- Tenant admins see all leads in their tenant
  is_tenant_admin(auth.uid(), tenant_id)
  OR
  -- Regular users see only leads assigned to them or created by them (within their tenant)
  (
    is_tenant_member(auth.uid(), tenant_id)
    AND (
      auth.uid() = assigned_to 
      OR auth.uid() = created_by
    )
  )
);