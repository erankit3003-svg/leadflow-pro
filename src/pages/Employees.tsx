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
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, Search, Shield, UserCog, Mail, Phone, Crown } from 'lucide-react';
import { format } from 'date-fns';

interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  role: 'super_admin' | 'admin' | 'sales_executive';
}

export default function Employees() {
  const { user, role: currentUserRole, isSuperAdmin, isAdmin } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'sales_executive' as 'super_admin' | 'admin' | 'sales_executive',
  });

  const fetchEmployees = async () => {
    setLoading(true);
    
    // Fetch profiles with their roles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
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

    // Fetch all roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
    }

    // Combine profiles with roles
    const employeesWithRoles = (profiles || []).map((profile: any) => {
      const userRole = (roles || []).find((r: any) => r.user_id === profile.user_id);
      return {
        ...profile,
        role: userRole?.role || 'sales_executive',
      };
    });

    setEmployees(employeesWithRoles as Employee[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'super_admin' | 'admin' | 'sales_executive') => {
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

    setAddingEmployee(true);

    // Create profile for the new employee
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        user_id: crypto.randomUUID(), // Temporary user_id until they sign up
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating employee profile:', profileError);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add employee. Email may already exist.',
      });
      setAddingEmployee(false);
      return;
    }

    // Create user role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: profileData.user_id,
        role: formData.role,
      });

    if (roleError) {
      console.error('Error creating employee role:', roleError);
    }

    toast({
      title: 'Employee Added',
      description: `${formData.full_name} has been added as ${formData.role.replace('_', ' ')}.`,
    });

    setFormData({ full_name: '', email: '', phone: '', role: 'sales_executive' });
    setIsAddDialogOpen(false);
    setAddingEmployee(false);
    fetchEmployees();
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
            <p className="text-muted-foreground">Manage your team members</p>
          </div>
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
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
          )}
        </div>

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
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> New employees are added automatically when they sign up. 
              By default, new users are assigned the "Sales Executive" role. Admins can change roles below.
            </p>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading employees...
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                          <Select
                            value={employee.role}
                            onValueChange={(value) =>
                              handleRoleChange(employee.user_id, value as 'super_admin' | 'admin' | 'sales_executive')
                            }
                            disabled={employee.role === 'super_admin' && !isSuperAdmin}
                          >
                            <SelectTrigger className="w-[180px]">
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
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
