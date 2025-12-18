export type LeadStatus = 'new' | 'contacted' | 'follow-up' | 'interested' | 'proposal' | 'won' | 'lost';

export type LeadSource = 'website' | 'referral' | 'social' | 'cold-call' | 'email' | 'advertisement' | 'other';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  requirement: string;
  source: LeadSource;
  status: LeadStatus;
  value: number;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  followUpDate?: Date;
  notes: string[];
  lostReason?: string;
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
  'follow-up': { label: 'Follow-Up', color: 'text-warning', bgColor: 'bg-warning/10' },
  'interested': { label: 'Interested', color: 'text-accent', bgColor: 'bg-accent/10' },
  'proposal': { label: 'Proposal Sent', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  'won': { label: 'Won', color: 'text-success', bgColor: 'bg-success/10' },
  'lost': { label: 'Lost', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

export const SOURCE_CONFIG: Record<LeadSource, { label: string; icon: string }> = {
  'website': { label: 'Website', icon: 'Globe' },
  'referral': { label: 'Referral', icon: 'Users' },
  'social': { label: 'Social Media', icon: 'Share2' },
  'cold-call': { label: 'Cold Call', icon: 'Phone' },
  'email': { label: 'Email', icon: 'Mail' },
  'advertisement': { label: 'Advertisement', icon: 'Megaphone' },
  'other': { label: 'Other', icon: 'MoreHorizontal' },
};
