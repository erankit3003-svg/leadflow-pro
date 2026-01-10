-- Create employee activity log table
CREATE TABLE public.employee_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_details TEXT,
  old_value TEXT,
  new_value TEXT,
  performed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employee_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.employee_activity_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Policy: Admins can insert activity logs
CREATE POLICY "Admins can insert activity logs"
ON public.employee_activity_logs
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create index for faster queries
CREATE INDEX idx_employee_activity_logs_employee ON public.employee_activity_logs(employee_user_id);
CREATE INDEX idx_employee_activity_logs_created_at ON public.employee_activity_logs(created_at DESC);