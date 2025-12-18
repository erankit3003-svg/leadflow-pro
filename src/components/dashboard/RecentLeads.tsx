import { Lead, STATUS_CONFIG } from '@/types/lead';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface RecentLeadsProps {
  leads: Lead[];
}

export function RecentLeads({ leads }: RecentLeadsProps) {
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

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Leads</h3>
        <Link to="/leads" className="text-sm text-primary font-medium hover:underline">
          View All
        </Link>
      </div>
      <div className="space-y-4">
        {leads.slice(0, 5).map((lead) => {
          const statusConfig = STATUS_CONFIG[lead.status];
          return (
            <div
              key={lead.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {lead.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.company || lead.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'status-badge',
                    statusConfig.bgColor,
                    statusConfig.color
                  )}
                >
                  {statusConfig.label}
                </span>
                <span className="text-sm font-medium text-foreground">
                  ₹{lead.value.toLocaleString()}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded hover:bg-muted">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleCall(lead.phone)}>
                      Call
                    </DropdownMenuItem>
                    {lead.email && (
                      <DropdownMenuItem onClick={() => handleEmail(lead.email)}>
                        Send Email
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleWhatsApp(lead.phone)}>
                      WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/leads">View Details</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
