import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Lead } from '@/types/lead';
import { mockLeads } from '@/data/mockData';

interface LeadsContextType {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  updateLead: (leadId: string, updates: Partial<Lead>) => void;
  updateNotes: (leadId: string, notes: Lead['notes']) => void;
  addLead: (lead: Lead) => void;
  deleteLead: (leadId: string) => void;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);

  const updateLead = (leadId: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, ...updates, updatedAt: new Date() } : l))
    );
  };

  const updateNotes = (leadId: string, notes: Lead['notes']) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes, updatedAt: new Date() } : l))
    );
  };

  const addLead = (lead: Lead) => {
    setLeads((prev) => [...prev, lead]);
  };

  const deleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  return (
    <LeadsContext.Provider value={{ leads, setLeads, updateLead, updateNotes, addLead, deleteLead }}>
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
