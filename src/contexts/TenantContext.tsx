import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Tenant {
  id: string;
  name: string;
  industry: string | null;
  email: string | null;
  phone: string | null;
  role: 'admin' | 'sales_executive';
}

interface TenantContextType {
  tenants: Tenant[];
  activeTenant: Tenant | null;
  setActiveTenant: (tenant: Tenant) => void;
  loading: boolean;
  isAdmin: boolean;
  refreshTenants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const ACTIVE_TENANT_KEY = 'active_tenant_id';

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenant, setActiveTenantState] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    if (!user) {
      setTenants([]);
      setActiveTenantState(null);
      setLoading(false);
      return;
    }

    try {
      const { data: memberships, error } = await supabase
        .from('tenant_memberships')
        .select(`
          company_id,
          role,
          companies:company_id (
            id,
            name,
            industry,
            email,
            phone
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const tenantList: Tenant[] = (memberships || [])
        .filter(m => m.companies)
        .map(m => ({
          id: (m.companies as any).id,
          name: (m.companies as any).name,
          industry: (m.companies as any).industry,
          email: (m.companies as any).email,
          phone: (m.companies as any).phone,
          role: m.role as 'admin' | 'sales_executive',
        }));

      setTenants(tenantList);

      // Restore active tenant from localStorage or use first tenant
      const savedTenantId = localStorage.getItem(ACTIVE_TENANT_KEY);
      const savedTenant = tenantList.find(t => t.id === savedTenantId);
      
      if (savedTenant) {
        setActiveTenantState(savedTenant);
      } else if (tenantList.length > 0) {
        setActiveTenantState(tenantList[0]);
        localStorage.setItem(ACTIVE_TENANT_KEY, tenantList[0].id);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const setActiveTenant = (tenant: Tenant) => {
    setActiveTenantState(tenant);
    localStorage.setItem(ACTIVE_TENANT_KEY, tenant.id);
  };

  const refreshTenants = async () => {
    await fetchTenants();
  };

  useEffect(() => {
    fetchTenants();
  }, [user]);

  const isAdmin = activeTenant?.role === 'admin';

  return (
    <TenantContext.Provider value={{ 
      tenants, 
      activeTenant, 
      setActiveTenant, 
      loading,
      isAdmin,
      refreshTenants
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
