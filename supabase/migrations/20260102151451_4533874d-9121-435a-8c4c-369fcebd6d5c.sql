-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'sales_executive');

-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'follow_up', 'interested', 'proposal_sent', 'won', 'lost');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'sales_executive',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  industry TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  requirement TEXT,
  source TEXT,
  value NUMERIC DEFAULT 0,
  status lead_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  won_reason TEXT,
  lost_reason TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_notes table
CREATE TABLE public.lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

-- Create has_role function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Companies policies
CREATE POLICY "Authenticated users can view companies" ON public.companies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create companies" ON public.companies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update companies" ON public.companies
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete companies" ON public.companies
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Leads policies
CREATE POLICY "Users can view all leads" ON public.leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create leads" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update assigned leads or admins" ON public.leads
  FOR UPDATE TO authenticated USING (
    auth.uid() = assigned_to OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete leads" ON public.leads
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lead notes policies
CREATE POLICY "Users can view lead notes" ON public.lead_notes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create notes" ON public.lead_notes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own notes" ON public.lead_notes
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own notes or admins" ON public.lead_notes
  FOR DELETE TO authenticated USING (
    auth.uid() = created_by OR public.has_role(auth.uid(), 'admin')
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email), NEW.email);
  
  -- Assign default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'sales_executive');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_notes_updated_at BEFORE UPDATE ON public.lead_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();