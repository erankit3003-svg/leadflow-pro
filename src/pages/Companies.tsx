import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building2, Search, Globe, Phone, Mail, MapPin, Users, Loader2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface Company {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  industry: string | null;
  created_at: string;
  isMember?: boolean;
  memberRole?: string;
}

export default function Companies() {
  const { user } = useAuth();
  const { tenants, refreshTenants, activeTenant } = useTenant();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [joiningCompanyId, setJoiningCompanyId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    industry: '',
  });

  const tenantIds = tenants.map(t => t.id);

  const fetchCompanies = async () => {
    setLoading(true);
    
    // First fetch companies the user is a member of
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load companies',
      });
      setCompanies([]);
    } else {
      // Mark which companies the user is a member of
      const companiesWithMembership = (data || []).map(company => {
        const membership = tenants.find(t => t.id === company.id);
        return {
          ...company,
          isMember: !!membership,
          memberRole: membership?.role,
        };
      });
      setCompanies(companiesWithMembership as Company[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (tenants) {
      fetchCompanies();
    }
  }, [tenants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Company name is required',
      });
      return;
    }

    // Create the company
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        website: formData.website.trim() || null,
        industry: formData.industry.trim() || null,
        created_by: user?.id,
      })
      .select()
      .single();

    if (companyError) {
      console.error('Error creating company:', companyError);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create company',
      });
      return;
    }

    // Add user as admin of the new company
    const { error: membershipError } = await supabase
      .from('tenant_memberships')
      .insert({
        user_id: user?.id,
        company_id: companyData.id,
        role: 'admin',
        is_active: true,
      });

    if (membershipError) {
      console.error('Error creating membership:', membershipError);
      toast({
        variant: 'destructive',
        title: 'Warning',
        description: 'Company created but failed to add you as admin',
      });
    } else {
      toast({
        title: '🎉 Success',
        description: 'Company created! You are now the admin.',
      });
    }

    setFormData({ name: '', email: '', phone: '', address: '', website: '', industry: '' });
    setIsDialogOpen(false);
    await refreshTenants();
    fetchCompanies();
  };

  const handleJoinCompany = async (companyId: string) => {
    if (!user) return;
    
    setJoiningCompanyId(companyId);
    
    const { error } = await supabase
      .from('tenant_memberships')
      .insert({
        user_id: user.id,
        company_id: companyId,
        role: 'sales_executive',
        is_active: true,
      });

    if (error) {
      console.error('Error joining company:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message.includes('duplicate') 
          ? 'You are already a member of this company' 
          : 'Failed to join company',
      });
    } else {
      toast({
        title: '🎉 Joined!',
        description: 'You have joined the company as a Sales Executive.',
      });
      await refreshTenants();
      fetchCompanies();
    }
    
    setJoiningCompanyId(null);
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myCompanies = filteredCompanies.filter(c => c.isMember);
  const otherCompanies = filteredCompanies.filter(c => !c.isMember);

  return (
    <MainLayout>
      <Header 
        title="Companies" 
        subtitle="Manage your organizations and team memberships"
        onAddNew={() => setIsDialogOpen(true)}
        addNewLabel="Create Company"
      />
      
      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                My Companies
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myCompanies.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Company
              </CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">{activeTenant?.name || 'None'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available to Join
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{otherCompanies.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* My Companies */}
        <div>
          <h2 className="text-lg font-semibold mb-4">My Companies</h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>My Role</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Website</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : myCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        You haven't joined any companies yet. Create one or join an existing company below.
                      </TableCell>
                    </TableRow>
                  ) : (
                    myCompanies.map((company) => (
                      <TableRow key={company.id} className={activeTenant?.id === company.id ? 'bg-primary/5' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{company.name}</p>
                                {activeTenant?.id === company.id && (
                                  <Badge variant="secondary" className="text-xs">Active</Badge>
                                )}
                              </div>
                              {company.address && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {company.address}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={company.memberRole === 'admin' ? 'default' : 'outline'}>
                            {company.memberRole === 'admin' ? 'Admin' : 'Sales Executive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-secondary">
                            {company.industry || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {company.email && (
                              <p className="text-sm flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {company.email}
                              </p>
                            )}
                            {company.phone && (
                              <p className="text-sm flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {company.phone}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {company.website ? (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              <Globe className="h-3 w-3" />
                              Visit
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Other Companies (Available to Join) */}
        {otherCompanies.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Available Companies</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otherCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{company.name}</p>
                              {company.address && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {company.address}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-secondary">
                            {company.industry || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(company.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleJoinCompany(company.id)}
                            disabled={joiningCompanyId === company.id}
                          >
                            {joiningCompanyId === company.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Users className="h-4 w-4 mr-1" />
                                Join
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create Company Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Company</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Acme Inc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Technology"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Business St, City"
              />
            </div>
            <Button type="submit" className="w-full gradient-primary">
              Create Company
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
