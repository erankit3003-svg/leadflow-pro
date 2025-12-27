import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Lead, LeadStatus, STATUS_CONFIG } from '@/types/lead';
import { LeadCard } from './LeadCard';
import { cn } from '@/lib/utils';
import { Plus, Inbox } from 'lucide-react';

interface PipelineColumnProps {
  status: LeadStatus;
  leads: Lead[];
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
  onAddLead?: (status: LeadStatus) => void;
}

const STATUS_ICONS: Record<LeadStatus, string> = {
  'new': '✨',
  'contacted': '📞',
  'follow-up': '📅',
  'interested': '🎯',
  'proposal': '📄',
  'won': '🏆',
  'lost': '❌',
};

const STATUS_GRADIENTS: Record<LeadStatus, string> = {
  'new': 'from-blue-500/20 to-blue-600/5',
  'contacted': 'from-indigo-500/20 to-indigo-600/5',
  'follow-up': 'from-amber-500/20 to-amber-600/5',
  'interested': 'from-teal-500/20 to-teal-600/5',
  'proposal': 'from-purple-500/20 to-purple-600/5',
  'won': 'from-emerald-500/20 to-emerald-600/5',
  'lost': 'from-red-500/20 to-red-600/5',
};

const STATUS_HEADER_COLORS: Record<LeadStatus, string> = {
  'new': 'bg-blue-500',
  'contacted': 'bg-indigo-500',
  'follow-up': 'bg-amber-500',
  'interested': 'bg-teal-500',
  'proposal': 'bg-purple-500',
  'won': 'bg-emerald-500',
  'lost': 'bg-red-500',
};

export function PipelineColumn({ status, leads, onEditLead, onDeleteLead, onAddLead }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = STATUS_CONFIG[status];
  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);

  return (
    <div className="flex-shrink-0 w-[320px] animate-fade-in">
      {/* Column Header */}
      <div className={cn(
        'rounded-t-xl p-4 bg-gradient-to-b',
        STATUS_GRADIENTS[status]
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{STATUS_ICONS[status]}</span>
            <h3 className="font-semibold text-foreground">{config.label}</h3>
            <span className={cn(
              'flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold text-white',
              STATUS_HEADER_COLORS[status]
            )}>
              {leads.length}
            </span>
          </div>
          {onAddLead && (
            <button
              onClick={() => onAddLead(status)}
              className="p-1.5 rounded-lg hover:bg-background/50 transition-colors text-muted-foreground hover:text-foreground"
              aria-label={`Add lead to ${config.label}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Value</span>
          <span className="font-bold text-foreground">₹{totalValue.toLocaleString()}</span>
        </div>
        {/* Progress indicator */}
        <div className="mt-3 h-1 bg-background/30 rounded-full overflow-hidden">
          <div 
            className={cn('h-full rounded-full transition-all duration-500', STATUS_HEADER_COLORS[status])}
            style={{ width: `${Math.min((leads.length / 10) * 100, 100)}%` }}
          />
        </div>
      </div>
      
      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={cn(
          'bg-muted/30 rounded-b-xl p-3 min-h-[450px] border border-t-0 border-border/50 transition-all duration-200',
          isOver && 'bg-primary/5 ring-2 ring-primary/30 ring-inset'
        )}
      >
        <SortableContext
          items={leads.map(l => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {leads.map((lead, index) => (
              <div 
                key={lead.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <LeadCard
                  lead={lead}
                  onEdit={onEditLead}
                  onDelete={onDeleteLead}
                />
              </div>
            ))}
          </div>
        </SortableContext>
        
        {leads.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Inbox className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No leads yet</p>
            <p className="text-xs opacity-70">Drag leads here or add new</p>
          </div>
        )}
      </div>
    </div>
  );
}
