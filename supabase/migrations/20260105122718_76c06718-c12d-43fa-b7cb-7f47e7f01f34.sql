-- Create tenant memberships table (users can belong to multiple companies/tenants)
CREATE TABLE public.tenant_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'sales_executive',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Add tenant_id to leads table
ALTER TABLE public.leads ADD COLUMN tenant_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Add tenant_id to lead_notes table  
ALTER TABLE public.lead_notes ADD COLUMN tenant_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Enable RLS on tenant_memberships
ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;

-- Function to check if user is member of a tenant
CREATE OR REPLACE FUNCTION public.is_tenant_member(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships
    WHERE user_id = _user_id
      AND company_id = _tenant_id
      AND is_active = true
  )
$$;

-- Function to check tenant admin role
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships
    WHERE user_id = _user_id
      AND company_id = _tenant_id
      AND role = 'admin'
      AND is_active = true
  )
$$;

-- Function to get user's active tenant IDs
CREATE OR REPLACE FUNCTION public.get_user_tenant_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id
  FROM public.tenant_memberships
  WHERE user_id = _user_id
    AND is_active = true
$$;

-- RLS policies for tenant_memberships
CREATE POLICY "Users can view their own memberships"
ON public.tenant_memberships
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Tenant admins can view all tenant memberships"
ON public.tenant_memberships
FOR SELECT
USING (is_tenant_admin(auth.uid(), company_id));

CREATE POLICY "Tenant admins can manage memberships"
ON public.tenant_memberships
FOR ALL
USING (is_tenant_admin(auth.uid(), company_id));

-- Update companies RLS to be tenant-aware
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can update companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON public.companies;

CREATE POLICY "Users can view their tenant companies"
ON public.companies
FOR SELECT
USING (id IN (SELECT public.get_user_tenant_ids(auth.uid())));

CREATE POLICY "Tenant admins can update their companies"
ON public.companies
FOR UPDATE
USING (is_tenant_admin(auth.uid(), id));

CREATE POLICY "Tenant admins can delete their companies"
ON public.companies
FOR DELETE
USING (is_tenant_admin(auth.uid(), id));

-- Update leads RLS to be tenant-aware
DROP POLICY IF EXISTS "Users can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update assigned leads or admins" ON public.leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;

CREATE POLICY "Users can view tenant leads"
ON public.leads
FOR SELECT
USING (tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid())));

CREATE POLICY "Tenant members can create leads"
ON public.leads
FOR INSERT
WITH CHECK (
  auth.uid() = created_by 
  AND is_tenant_member(auth.uid(), tenant_id)
);

CREATE POLICY "Tenant members can update leads"
ON public.leads
FOR UPDATE
USING (
  is_tenant_member(auth.uid(), tenant_id)
  AND (auth.uid() = assigned_to OR is_tenant_admin(auth.uid(), tenant_id))
);

CREATE POLICY "Tenant admins can delete leads"
ON public.leads
FOR DELETE
USING (is_tenant_admin(auth.uid(), tenant_id));

-- Update lead_notes RLS to be tenant-aware
DROP POLICY IF EXISTS "Users can view lead notes" ON public.lead_notes;
DROP POLICY IF EXISTS "Users can create notes" ON public.lead_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.lead_notes;
DROP POLICY IF EXISTS "Users can delete own notes or admins" ON public.lead_notes;

CREATE POLICY "Users can view tenant lead notes"
ON public.lead_notes
FOR SELECT
USING (tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid())));

CREATE POLICY "Tenant members can create notes"
ON public.lead_notes
FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND is_tenant_member(auth.uid(), tenant_id)
);

CREATE POLICY "Users can update own notes"
ON public.lead_notes
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own notes or tenant admins"
ON public.lead_notes
FOR DELETE
USING (
  auth.uid() = created_by 
  OR is_tenant_admin(auth.uid(), tenant_id)
);

-- Trigger for updated_at on tenant_memberships
CREATE TRIGGER update_tenant_memberships_updated_at
BEFORE UPDATE ON public.tenant_memberships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();