import { Lead, STATUS_CONFIG } from '@/types/lead';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Phone,
  Mail,
  Building2,
  Calendar,
  IndianRupee,
  MessageSquare,
  Edit,
  Globe,
  Clock,
  User,
} from 'lucide-react';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (lead: Lead) => void;
  onViewNotes?: (lead: Lead) => void;
}

export function LeadDetailDrawer({ lead, open, onClose, onEdit, onViewNotes }: LeadDetailDrawerProps) {

  if (!lead) {
    return (
      <Sheet open={false} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Loading...</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const currentStatusConfig = STATUS_CONFIG[lead.status];
  const currentInitials = lead.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-4 ring-background shadow-lg">
              <span className="text-xl font-bold text-primary">{currentInitials}</span>
            </div>
            <div className="flex-1">
              <SheetTitle className="text-xl">{lead.name}</SheetTitle>
              {lead.company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Building2 className="h-4 w-4" />
                  {lead.company}
                </p>
              )}
            </div>
          </div>
          <Badge
            className="w-fit"
            style={{
              backgroundColor: `${currentStatusConfig.color}20`,
              color: currentStatusConfig.color,
              borderColor: `${currentStatusConfig.color}40`,
            }}
          >
            {currentStatusConfig.label}
          </Badge>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onEdit?.(lead)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Lead
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => onViewNotes?.(lead)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Notes ({lead.notes?.length || 0})
            </Button>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Contact Information</h4>
            <div className="space-y-2">
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{lead.phone}</p>
                  <p className="text-xs text-muted-foreground">Phone</p>
                </div>
              </a>
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{lead.email}</p>
                    <p className="text-xs text-muted-foreground">Email</p>
                  </div>
                </a>
              )}
            </div>
          </div>

          <Separator />

          {/* Lead Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Lead Details</h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">₹{lead.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Deal Value</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{lead.source.replace('-', ' ')}</p>
                  <p className="text-xs text-muted-foreground">Lead Source</p>
                </div>
              </div>
              {lead.followUpDate && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {format(lead.followUpDate, 'PPP')}
                    </p>
                    <p className="text-xs text-muted-foreground">Follow-up Date</p>
                  </div>
                </div>
              )}
              {lead.assignedTo && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-9 w-9 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{lead.assignedTo}</p>
                    <p className="text-xs text-muted-foreground">Assigned To</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Requirement */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Requirement</h4>
            <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
              {lead.requirement}
            </p>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Created: {format(lead.createdAt, 'PPp')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Updated: {format(lead.updatedAt, 'PPp')}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
