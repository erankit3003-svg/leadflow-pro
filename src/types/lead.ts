export type LeadStatus = 'new' | 'contacted' | 'follow_up' | 'interested' | 'proposal_sent' | 'won' | 'lost';

export type LeadSource = 'website' | 'referral' | 'social' | 'cold-call' | 'email' | 'advertisement' | 'other';

export interface LeadNote {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string | null;
}

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company?: string | null;
  companyId?: string | null;
  tenantId?: string | null;
  requirement: string | null;
  source: string | null;
  status: LeadStatus;
  value: number;
  assignedTo?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  followUpDate?: Date | null;
  notes: LeadNote[];
  lostReason?: string | null;
  wonReason?: string | null;
}

export interface FollowUp {
  id: string;
  leadId: string;
  date: Date;
  time: string;
  type: 'call' | 'email' | 'meeting' | 'whatsapp';
  notes?: string;
  completed: boolean;
}

export interface Activity {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'note' | 'status_change' | 'meeting';
  description: string;
  timestamp: Date;
  user?: string;
}

export const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
  'new': { label: 'New', color: 'text-info', bgColor: 'bg-info/10' },
  'contacted': { label: 'Contacted', color: 'text-primary', bgColor: 'bg-primary/10' },
  'follow_up': { label: 'Follow-Up', color: 'text-warning', bgColor: 'bg-warning/10' },
  'interested': { label: 'Interested', color: 'text-accent', bgColor: 'bg-accent/10' },
  'proposal_sent': { label: 'Proposal Sent', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  'won': { label: 'Won', color: 'text-success', bgColor: 'bg-success/10' },
  'lost': { label: 'Lost', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

export const SOURCE_CONFIG: Record<string, { label: string; icon: string }> = {
  'website': { label: 'Website', icon: 'Globe' },
  'referral': { label: 'Referral', icon: 'Users' },
  'social': { label: 'Social Media', icon: 'Share2' },
  'cold-call': { label: 'Cold Call', icon: 'Phone' },
  'email': { label: 'Email', icon: 'Mail' },
  'advertisement': { label: 'Advertisement', icon: 'Megaphone' },
  'other': { label: 'Other', icon: 'MoreHorizontal' },
};
