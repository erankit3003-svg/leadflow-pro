import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, Search, Shield, UserCog, Mail, Phone, Crown, Pencil, History, Clock, Building2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  role: 'super_admin' | 'admin' | 'sales_executive';
  tenant_names: string[];
}

interface ActivityLog {
  id: string;
  employee_user_id: string;
  action_type: string;
  action_details: string | null;
  old_value: string | null;
  new_value: string | null;
  performed_by: string | null;
  created_at: string;
  performer_name?: string;
  employee_name?: string;
}

export default function Employees() {
  const { user, role: currentUserRole, isSuperAdmin, isAdmin } = useAuth();
  const { activeTenant, loading: tenantLoading } = useTenant();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'sales_executive' as 'super_admin' | 'admin' | 'sales_executive',
  });
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [showActivityLog, setShowActivityLog] = useState(false);

  const fetchEmployees = async () => {
    if (!activeTenant && !isSuperAdmin) {
      setEmployees([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // First, get the user IDs of members in the current tenant
      let memberUserIds: string[] = [];
      
      if (isSuperAdmin && !activeTenant) {
        // Super admin without active tenant sees all employees
        const { data: allMemberships } = await supabase
          .from('tenant_memberships')
          .select('user_id')
          .eq('is_active', true);
        memberUserIds = [...new Set((allMemberships || []).map(m => m.user_id))];
      } else if (activeTenant) {
        // Get members of the active tenant
        const { data: memberships, error: memberError } = await supabase
          .from('tenant_memberships')
          .select('user_id')
          .eq('company_id', activeTenant.id)
          .eq('is_active', true);

        if (memberError) {
          console.error('Error fetching tenant members:', memberError);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load employees',
          });
          setLoading(false);
          return;
        }
        memberUserIds = (memberships || []).map(m => m.user_id);
      }

      if (memberUserIds.length === 0) {
        setEmployees([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', memberUserIds)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load employees',
        });
        setLoading(false);
        return;
      }

      // Fetch roles for these users
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', memberUserIds);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }

      // Fetch tenant memberships with company names for these users
      const { data: membershipsWithCompanies } = await supabase
        .from('tenant_memberships')
        .select('user_id, companies(name)')
        .in('user_id', memberUserIds)
        .eq('is_active', true);

      // Group company names by user_id
      const userTenantNames: Record<string, string[]> = {};
      (membershipsWithCompanies || []).forEach((m: any) => {
        const companyName = m.companies?.name;
        if (companyName) {
          if (!userTenantNames[m.user_id]) {
            userTenantNames[m.user_id] = [];
          }
          if (!userTenantNames[m.user_id].includes(companyName)) {
            userTenantNames[m.user_id].push(companyName);
          }
        }
      });

      // Combine profiles with roles and tenant names
      const employeesWithRoles = (profiles || []).map((profile: any) => {
        const userRole = (roles || []).find((r: any) => r.user_id === profile.user_id);
        return {
          ...profile,
          role: userRole?.role || 'sales_executive',
          tenant_names: userTenantNames[profile.user_id] || [],
        };
      });

      setEmployees(employeesWithRoles as Employee[]);
    } catch (error) {
      console.error('Error in fetchEmployees:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    const { data, error } = await supabase
      .from('employee_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching activity logs:', error);
      return;
    }

    // Get performer and employee names
    const logsWithNames = await Promise.all(
      (data || []).map(async (log: any) => {
        let performerName = 'Unknown';
        let employeeName = 'Unknown';

        if (log.performed_by) {
          const performer = employees.find(e => e.user_id === log.performed_by);
          performerName = performer?.full_name || 'Unknown';
        }

        const employee = employees.find(e => e.user_id === log.employee_user_id);
        employeeName = employee?.full_name || 'Unknown';

        return {
          ...log,
          performer_name: performerName,
          employee_name: employeeName,
        };
      })
    );

    setActivityLogs(logsWithNames);
  };

  useEffect(() => {
    if (!tenantLoading) {
      fetchEmployees();
    }
  }, [activeTenant, tenantLoading, isSuperAdmin]);

  useEffect(() => {
    if (employees.length > 0 && isAdmin) {
      fetchActivityLogs();
    }
  }, [employees, isAdmin]);

  const logActivity = async (
    employeeUserId: string,
    actionType: string,
    actionDetails: string,
    oldValue?: string,
    newValue?: string
  ) => {
    await supabase.from('employee_activity_logs').insert({
      employee_user_id: employeeUserId,
      action_type: actionType,
      action_details: actionDetails,
      old_value: oldValue || null,
      new_value: newValue || null,
      performed_by: user?.id,
    });
  };

  const handleRoleChange = async (userId: string, newRole: 'super_admin' | 'admin' | 'sales_executive', currentRole: string) => {
    // Only super_admin can assign super_admin role
    if (newRole === 'super_admin' && !isSuperAdmin) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Only Super Admins can assign Super Admin role',
      });
      return;
    }
    
    if (!isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Only admins can change user roles',
      });
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating role:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update role',
      });
    } else {
      // Log the role change
      const employee = employees.find(e => e.user_id === userId);
      await logActivity(
        userId,
        'role_change',
        `Role changed for ${employee?.full_name || 'employee'}`,
        currentRole,
        newRole
      );
      
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });
      fetchEmployees();
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Name and email are required',
      });
      return;
    }

    // Check if current user is admin
    if (!isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Only admins can add employees',
      });
      return;
    }

    setAddingEmployee(true);

    try {
      // Use Supabase Auth Admin API to invite user (this creates a real auth user)
      // For now, we'll sign up the user with a temporary password they'll need to reset
      const tempPassword = crypto.randomUUID();
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: tempPassword,
        options: {
          data: {
            full_name: formData.full_name.trim(),
          },
        },
      });

      if (authError) {
        console.error('Error creating employee auth:', authError);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: authError.message || 'Failed to add employee. Email may already exist.',
        });
        setAddingEmployee(false);
        return;
      }

      if (!authData.user) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create user account',
        });
        setAddingEmployee(false);
        return;
      }

      // Update the profile with phone number if provided
      if (formData.phone.trim()) {
        await supabase
          .from('profiles')
          .update({ phone: formData.phone.trim() })
          .eq('user_id', authData.user.id);
      }

      // Update user role if not default
      if (formData.role !== 'sales_executive') {
        await supabase
          .from('user_roles')
          .update({ role: formData.role })
          .eq('user_id', authData.user.id);
      }

      // Add employee to the current tenant
      if (activeTenant) {
        const { error: membershipError } = await supabase
          .from('tenant_memberships')
          .insert({
            user_id: authData.user.id,
            company_id: activeTenant.id,
            role: formData.role === 'super_admin' ? 'admin' : formData.role,
            is_active: true,
          });

        if (membershipError) {
          console.error('Error adding tenant membership:', membershipError);
          // Don't fail the whole operation, just log the error
        }
      }

      // Log employee creation
      await logActivity(
        authData.user.id,
        'employee_added',
        `New employee ${formData.full_name} added with role ${formData.role.replace('_', ' ')}${activeTenant ? ` to ${activeTenant.name}` : ''}`
      );

      toast({
        title: 'Employee Added',
        description: `${formData.full_name} has been added. They will receive an email to set their password.`,
      });

      setFormData({ full_name: '', email: '', phone: '', role: 'sales_executive' });
      setIsAddDialogOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
    } finally {
      setAddingEmployee(false);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditFormData({
      full_name: employee.full_name,
      email: employee.email,
      phone: employee.phone || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEmployee) return;
    
    if (!editFormData.full_name.trim() || !editFormData.email.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Name and email are required',
      });
      return;
    }

    setSavingEdit(true);

    // Track changes for activity log
    const changes: string[] = [];
    if (editFormData.full_name !== editingEmployee.full_name) {
      changes.push(`name: ${editingEmployee.full_name} → ${editFormData.full_name}`);
    }
    if (editFormData.email !== editingEmployee.email) {
      changes.push(`email: ${editingEmployee.email} → ${editFormData.email}`);
    }
    if (editFormData.phone !== (editingEmployee.phone || '')) {
      changes.push(`phone: ${editingEmployee.phone || 'none'} → ${editFormData.phone || 'none'}`);
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editFormData.full_name.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim() || null,
      })
      .eq('id', editingEmployee.id);

    if (error) {
      console.error('Error updating employee:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update employee',
      });
    } else {
      // Log the edit
      if (changes.length > 0) {
        await logActivity(
          editingEmployee.user_id,
          'profile_edit',
          `Profile updated: ${changes.join(', ')}`
        );
      }

      toast({
        title: 'Success',
        description: 'Employee updated successfully',
      });
      setIsEditDialogOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
    }

    setSavingEdit(false);
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const superAdminCount = employees.filter((e) => e.role === 'super_admin').length;
  const adminCount = employees.filter((e) => e.role === 'admin').length;
  const salesCount = employees.filter((e) => e.role === 'sales_executive').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground">
              {activeTenant ? (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {activeTenant.name} - Manage team members
                </span>
              ) : isSuperAdmin ? (
                'All employees across tenants'
              ) : (
                'Select a company to view employees'
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" onClick={() => setShowActivityLog(!showActivityLog)}>
                <History className="h-4 w-4 mr-2" />
                {showActivityLog ? 'Hide Activity' : 'Activity Log'}
              </Button>
            )}
            {(isAdmin || isSuperAdmin) && activeTenant && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            )}
          </div>
        </div>

        {/* No Tenant Selected Warning */}
        {!activeTenant && !isSuperAdmin && (
          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="py-6 flex items-center gap-4">
              <Building2 className="h-8 w-8 text-yellow-500" />
              <div>
                <h3 className="font-semibold text-yellow-700 dark:text-yellow-400">No Company Selected</h3>
                <p className="text-sm text-muted-foreground">
                  Please select a company from the tenant switcher to view employees.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Employee Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddEmployee} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {isSuperAdmin && (
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        )}
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="sales_executive">Sales Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addingEmployee}>
                      {addingEmployee ? 'Adding...' : 'Add Employee'}
                    </Button>
                  </div>
                </form>
          </DialogContent>
        </Dialog>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Super Admins
              </CardTitle>
              <Crown className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{superAdminCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Admins
              </CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sales Executives
              </CardTitle>
              <UserCog className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        {(activeTenant || isSuperAdmin) && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> {activeTenant ? (
                  `Showing employees for ${activeTenant.name}. `
                ) : (
                  'Showing all employees across tenants. '
                )}
                New employees added here will be assigned to the current company. Admins can change roles below.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Employees Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading employees...
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {employee.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{employee.full_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {employee.email}
                          </p>
                          {employee.phone && (
                            <p className="text-sm flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {employee.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(employee.tenant_names || []).length > 0 ? (
                            (employee.tenant_names || []).map((name, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                <Building2 className="h-3 w-3 mr-1" />
                                {name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={employee.role === 'super_admin' ? 'default' : employee.role === 'admin' ? 'default' : 'secondary'}
                          className={employee.role === 'super_admin' ? 'bg-yellow-500 text-black' : employee.role === 'admin' ? 'bg-primary' : ''}
                        >
                          {employee.role === 'super_admin' ? (
                            <><Crown className="h-3 w-3 mr-1" /> Super Admin</>
                          ) : employee.role === 'admin' ? (
                            <><Shield className="h-3 w-3 mr-1" /> Admin</>
                          ) : (
                            <><UserCog className="h-3 w-3 mr-1" /> Sales Executive</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(employee.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditEmployee(employee)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Select
                              value={employee.role}
                              onValueChange={(value) =>
                                handleRoleChange(employee.user_id, value as 'super_admin' | 'admin' | 'sales_executive', employee.role)
                              }
                              disabled={employee.role === 'super_admin' && !isSuperAdmin}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {isSuperAdmin && (
                                  <SelectItem value="super_admin">Super Admin</SelectItem>
                                )}
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="sales_executive">Sales Executive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Activity Log Section */}
        {isAdmin && showActivityLog && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No activity logs yet.</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        log.action_type === 'role_change' ? 'bg-primary/20' :
                        log.action_type === 'profile_edit' ? 'bg-blue-500/20' :
                        'bg-green-500/20'
                      }`}>
                        {log.action_type === 'role_change' ? (
                          <Shield className="h-4 w-4 text-primary" />
                        ) : log.action_type === 'profile_edit' ? (
                          <Pencil className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Plus className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {log.action_type === 'role_change' ? 'Role Changed' :
                           log.action_type === 'profile_edit' ? 'Profile Edited' :
                           'Employee Added'}
                        </p>
                        <p className="text-sm text-muted-foreground">{log.action_details}</p>
                        {log.old_value && log.new_value && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <span className="line-through">{log.old_value}</span> → <span className="font-medium">{log.new_value}</span>
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </span>
                          {log.performer_name && (
                            <span className="text-xs text-muted-foreground">
                              by {log.performer_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Edit Employee Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_full_name">Full Name *</Label>
                <Input
                  id="edit_full_name"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email *</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_phone">Phone</Label>
                <Input
                  id="edit_phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="+1 234 567 890"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
