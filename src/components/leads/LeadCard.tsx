import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Lead, STATUS_CONFIG } from '@/types/lead';
import { Phone, Mail, Building2, Calendar, MoreVertical, GripVertical, MessageSquare, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface LeadCardProps {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  onViewNotes?: (lead: Lead) => void;
  onViewDetails?: (lead: Lead) => void;
}

export function LeadCard({ lead, onEdit, onDelete, onViewNotes, onViewDetails }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: lead.id });

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
  };

  const initials = lead.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const hasNotes = lead.notes && lead.notes.length > 0;

  const handleCardClick = () => {
    if (!isDragging) {
      onViewDetails?.(lead);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-card rounded-xl p-4 shadow-sm border border-border/50 transition-all duration-200 cursor-pointer',
        'hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5',
        isDragging && 'opacity-60 shadow-2xl ring-2 ring-primary/40 rotate-2 scale-105 z-50'
      )}
      onClick={handleCardClick}
    >
      {/* Drag Handle & Header */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-1 p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing touch-none transition-colors"
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to move lead"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        
        {/* Avatar */}
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-background shadow-sm">
            <span className="text-sm font-bold text-primary">
              {initials}
            </span>
          </div>
          {hasNotes && (
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-accent flex items-center justify-center">
              <MessageSquare className="h-2.5 w-2.5 text-accent-foreground" />
            </div>
          )}
        </div>
        
        {/* Name & Company */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{lead.name}</p>
          {lead.company && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <Building2 className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{lead.company}</span>
            </p>
          )}
        </div>
        
        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="p-1.5 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-all"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              aria-label="Lead actions"
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit?.(lead)}>
              Edit Lead
            </DropdownMenuItem>
            {onViewNotes && (
              <DropdownMenuItem onClick={() => onViewNotes(lead)}>
                View Notes
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete?.(lead.id)} className="text-destructive focus:text-destructive">
              Delete Lead
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Requirement */}
      <p className="text-xs text-muted-foreground mt-3 mb-3 line-clamp-2 pl-7">
        {lead.requirement}
      </p>

      {/* Contact Info */}
      <div className="flex items-center gap-3 mb-3 pl-7">
        <a 
          href={`tel:${lead.phone}`}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Phone className="h-3 w-3" />
          <span>{lead.phone}</span>
        </a>
        {lead.email && (
          <a 
            href={`mailto:${lead.email}`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50 pl-7">
        <div className="flex items-center gap-1 text-sm font-bold text-foreground">
          <IndianRupee className="h-3.5 w-3.5" />
          <span>{lead.value.toLocaleString()}</span>
        </div>
        {lead.followUpDate && (
          <Badge variant="outline" className="text-xs gap-1 font-normal">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(lead.followUpDate, { addSuffix: true })}
          </Badge>
        )}
      </div>
    </div>
  );
}
