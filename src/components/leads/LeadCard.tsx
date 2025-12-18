import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead, STATUS_CONFIG } from '@/types/lead';
import { Phone, Mail, Building2, Calendar, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LeadCardProps {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
}

export function LeadCard({ lead, onEdit, onDelete }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'lead-card',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary/20'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {lead.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{lead.name}</p>
            {lead.company && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {lead.company}
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded hover:bg-muted" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(lead)}>Edit Lead</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete?.(lead.id)} className="text-destructive">
              Delete Lead
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {lead.requirement}
      </p>

      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Phone className="h-3 w-3" />
          {lead.phone}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-sm font-semibold text-foreground">
          ₹{lead.value.toLocaleString()}
        </span>
        {lead.followUpDate && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(lead.followUpDate, { addSuffix: true })}
          </span>
        )}
      </div>
    </div>
  );
}
