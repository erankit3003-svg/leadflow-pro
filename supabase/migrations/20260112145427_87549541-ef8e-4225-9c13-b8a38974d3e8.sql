-- Revoke all access from anon role on profiles table
REVOKE ALL ON public.profiles FROM anon;

-- Revoke all access from anon role on employee_activity_logs table  
REVOKE ALL ON public.employee_activity_logs FROM anon;

-- Grant access only to authenticated users on profiles
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Grant access only to authenticated users on employee_activity_logs
GRANT SELECT, INSERT ON public.employee_activity_logs TO authenticated;