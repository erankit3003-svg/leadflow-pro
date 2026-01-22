import { Lead, STATUS_CONFIG, SOURCE_CONFIG } from '@/types/lead';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Phone, Mail, Calendar, MessageCircle, MessageSquare, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface LeadsTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onViewNotes: (lead: Lead) => void;
}

export function LeadsTable({ leads, onEdit, onDelete, onViewNotes }: LeadsTableProps) {
  const { toast } = useToast();

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleAddFollowUp = (lead: Lead) => {
    toast({
      title: 'Follow-up Scheduled',
      description: `Follow-up added for ${lead.name}. Go to Follow-ups page to manage.`,
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead>Lead</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const statusConfig = STATUS_CONFIG[lead.status];
            const sourceConfig = SOURCE_CONFIG[lead.source];
            
            return (
              <TableRow key={lead.id} className="hover:bg-muted/30">
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      {lead.company && (
                        <p className="text-sm text-muted-foreground">{lead.company}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <button 
                      onClick={() => handleCall(lead.phone)}
                      className="text-sm flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {lead.phone}
                    </button>
                    {lead.email && (
                      <button 
                        onClick={() => handleEmail(lead.email)}
                        className="text-sm flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {lead.email}
                      </button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {sourceConfig.label}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={cn('status-badge', statusConfig.bgColor, statusConfig.color)}>
                    {statusConfig.label}
                  </span>
                </TableCell>
                <TableCell>
                  {lead.assignedToName ? (
                    <div className="flex items-center gap-1.5 text-sm">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{lead.assignedToName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-foreground">
                    ₹{lead.value.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(lead.createdAt, 'MMM dd, yyyy')}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(lead)}>
                        Edit Lead
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewNotes(lead)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        View/Add Notes ({lead.notes?.length || 0})
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddFollowUp(lead)}>
                        Add Follow-up
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleCall(lead.phone)}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </DropdownMenuItem>
                      {lead.email && (
                        <DropdownMenuItem onClick={() => handleEmail(lead.email)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleWhatsApp(lead.phone)}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(lead.id)}
                        className="text-destructive"
                      >
                        Delete Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
