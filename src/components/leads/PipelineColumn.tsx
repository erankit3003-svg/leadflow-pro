import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Lead, LeadStatus, STATUS_CONFIG } from '@/types/lead';
import { LeadCard } from './LeadCard';
import { cn } from '@/lib/utils';

interface PipelineColumnProps {
  status: LeadStatus;
  leads: Lead[];
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
}

export function PipelineColumn({ status, leads, onEditLead, onDeleteLead }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = STATUS_CONFIG[status];
  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);

  return (
    <div className="flex-shrink-0 w-[300px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn('status-badge', config.bgColor, config.color)}>
            {config.label}
          </span>
          <span className="text-sm text-muted-foreground">
            {leads.length}
          </span>
        </div>
        <span className="text-sm font-medium text-foreground">
          ₹{totalValue.toLocaleString()}
        </span>
      </div>
      
      <div
        ref={setNodeRef}
        className={cn(
          'pipeline-column transition-colors',
          isOver && 'bg-primary/5 ring-2 ring-primary/20'
        )}
      >
        <SortableContext
          items={leads.map(l => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onEdit={onEditLead}
                onDelete={onDeleteLead}
              />
            ))}
          </div>
        </SortableContext>
        
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No leads
          </div>
        )}
      </div>
    </div>
  );
}
