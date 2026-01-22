import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './TenantContext';
import { useAuth } from './AuthContext';

interface LeadNote {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string | null;
}

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  companyId: string | null;
  tenantId: string | null;
  requirement: string | null;
  source: string | null;
  value: number;
  status: 'new' | 'contacted' | 'follow_up' | 'interested' | 'proposal_sent' | 'won' | 'lost';
  assignedTo: string | null;
  assignedToName: string | null;
  followUpDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  notes: LeadNote[];
  wonReason: string | null;
  lostReason: string | null;
}

interface LeadsContextType {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  refreshLeads: () => Promise<void>;
  updateLead: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  updateNotes: (leadId: string, notes: LeadNote[]) => void;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes'>) => Promise<Lead | null>;
  deleteLead: (leadId: string) => Promise<void>;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const { activeTenant } = useTenant();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    if (!activeTenant) {
      setLeads([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch leads for the active tenant
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('tenant_id', activeTenant.id)
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      // Fetch notes for all leads
      const leadIds = (leadsData || []).map(l => l.id);
      let notesMap: Record<string, LeadNote[]> = {};

      if (leadIds.length > 0) {
        const { data: notesData, error: notesError } = await supabase
          .from('lead_notes')
          .select('*')
          .in('lead_id', leadIds)
          .order('created_at', { ascending: false });

        if (notesError) throw notesError;

        notesMap = (notesData || []).reduce((acc, note) => {
          if (!acc[note.lead_id]) acc[note.lead_id] = [];
          acc[note.lead_id].push({
            id: note.id,
            content: note.content,
            createdAt: new Date(note.created_at),
            createdBy: note.created_by,
          });
          return acc;
        }, {} as Record<string, LeadNote[]>);
      }

      // Fetch profiles for assigned users
      const assignedUserIds = [...new Set((leadsData || []).map(l => l.assigned_to).filter(Boolean))];
      let profilesMap: Record<string, string> = {};

      if (assignedUserIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', assignedUserIds);

        if (!profilesError && profilesData) {
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.user_id] = profile.full_name;
            return acc;
          }, {} as Record<string, string>);
        }
      }

      const transformedLeads: Lead[] = (leadsData || []).map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: null,
        companyId: lead.company_id,
        tenantId: lead.tenant_id,
        requirement: lead.requirement,
        source: lead.source,
        value: Number(lead.value) || 0,
        status: lead.status,
        assignedTo: lead.assigned_to,
        assignedToName: lead.assigned_to ? profilesMap[lead.assigned_to] || null : null,
        followUpDate: lead.follow_up_date ? new Date(lead.follow_up_date) : null,
        createdAt: new Date(lead.created_at),
        updatedAt: new Date(lead.updated_at),
        createdBy: lead.created_by,
        notes: notesMap[lead.id] || [],
        wonReason: lead.won_reason,
        lostReason: lead.lost_reason,
      }));

      setLeads(transformedLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const refreshLeads = async () => {
    await fetchLeads();
  };

  const updateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      const dbUpdates: any = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.requirement !== undefined) dbUpdates.requirement = updates.requirement;
      if (updates.source !== undefined) dbUpdates.source = updates.source;
      if (updates.value !== undefined) dbUpdates.value = updates.value;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
      if (updates.followUpDate !== undefined) {
        dbUpdates.follow_up_date = updates.followUpDate?.toISOString() || null;
      }
      if (updates.wonReason !== undefined) dbUpdates.won_reason = updates.wonReason;
      if (updates.lostReason !== undefined) dbUpdates.lost_reason = updates.lostReason;

      const { error } = await supabase
        .from('leads')
        .update(dbUpdates)
        .eq('id', leadId);

      if (error) throw error;

      // Update local state
      setLeads(prev => 
        prev.map(l => l.id === leadId ? { ...l, ...updates, updatedAt: new Date() } : l)
      );
    } catch (err) {
      console.error('Error updating lead:', err);
      throw err;
    }
  };

  const updateNotes = (leadId: string, notes: LeadNote[]) => {
    setLeads(prev => 
      prev.map(l => l.id === leadId ? { ...l, notes } : l)
    );
  };

  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes'>): Promise<Lead | null> => {
    if (!activeTenant || !user) return null;

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          company_id: leadData.companyId,
          tenant_id: activeTenant.id,
          requirement: leadData.requirement,
          source: leadData.source,
          value: leadData.value,
          status: leadData.status,
          assigned_to: leadData.assignedTo,
          follow_up_date: leadData.followUpDate?.toISOString() || null,
          created_by: user.id,
          won_reason: leadData.wonReason,
          lost_reason: leadData.lostReason,
        })
        .select()
        .single();

      if (error) throw error;

      const newLead: Lead = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: null,
        companyId: data.company_id,
        tenantId: data.tenant_id,
        requirement: data.requirement,
        source: data.source,
        value: Number(data.value) || 0,
        status: data.status,
        assignedTo: data.assigned_to,
        assignedToName: null, // Will be populated on next fetch
        followUpDate: data.follow_up_date ? new Date(data.follow_up_date) : null,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        createdBy: data.created_by,
        notes: [],
        wonReason: data.won_reason,
        lostReason: data.lost_reason,
      };

      setLeads(prev => [newLead, ...prev]);
      return newLead;
    } catch (err) {
      console.error('Error adding lead:', err);
      throw err;
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prev => prev.filter(l => l.id !== leadId));
    } catch (err) {
      console.error('Error deleting lead:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [activeTenant]);

  return (
    <LeadsContext.Provider value={{ 
      leads, 
      loading, 
      error, 
      refreshLeads, 
      updateLead, 
      updateNotes, 
      addLead, 
      deleteLead 
    }}>
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
}
