-- Drop the existing update policy
DROP POLICY IF EXISTS "Tenant members can update leads" ON public.leads;

-- Create a more flexible update policy that allows:
-- 1. Users who are assigned to the lead
-- 2. Users who created the lead  
-- 3. Tenant admins
CREATE POLICY "Tenant members can update leads" 
ON public.leads 
FOR UPDATE 
USING (
  is_tenant_member(auth.uid(), tenant_id) 
  AND (
    auth.uid() = assigned_to 
    OR auth.uid() = created_by
    OR is_tenant_admin(auth.uid(), tenant_id)
  )
);