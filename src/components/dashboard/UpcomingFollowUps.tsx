import { FollowUp } from '@/types/lead';
import { mockLeads } from '@/data/mockData';
import { format, isToday, isPast } from 'date-fns';
import { Phone, Mail, Video, MessageCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpcomingFollowUpsProps {
  followUps: FollowUp[];
}

const typeIcons = {
  call: Phone,
  email: Mail,
  meeting: Video,
  whatsapp: MessageCircle,
};

export function UpcomingFollowUps({ followUps }: UpcomingFollowUpsProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Upcoming Follow-ups</h3>
        <button className="text-sm text-primary font-medium hover:underline">
          View All
        </button>
      </div>
      <div className="space-y-3">
        {followUps.map((followUp) => {
          const lead = mockLeads.find(l => l.id === followUp.leadId);
          const Icon = typeIcons[followUp.type];
          const isOverdue = isPast(followUp.date) && !isToday(followUp.date);
          const isTodayFollowUp = isToday(followUp.date);

          return (
            <div
              key={followUp.id}
              className={cn(
                'flex items-center gap-4 p-3 rounded-lg border transition-colors',
                isOverdue && 'bg-destructive/5 border-destructive/20',
                isTodayFollowUp && !isOverdue && 'bg-warning/5 border-warning/20',
                !isOverdue && !isTodayFollowUp && 'bg-secondary/50 border-transparent hover:bg-secondary'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-lg',
                  isOverdue && 'bg-destructive/10',
                  isTodayFollowUp && !isOverdue && 'bg-warning/10',
                  !isOverdue && !isTodayFollowUp && 'bg-primary/10'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4',
                    isOverdue && 'text-destructive',
                    isTodayFollowUp && !isOverdue && 'text-warning',
                    !isOverdue && !isTodayFollowUp && 'text-primary'
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {lead?.name || 'Unknown Lead'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {followUp.notes}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    'text-xs font-medium',
                    isOverdue && 'text-destructive',
                    isTodayFollowUp && !isOverdue && 'text-warning',
                    !isOverdue && !isTodayFollowUp && 'text-muted-foreground'
                  )}
                >
                  {isOverdue && (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Overdue
                    </span>
                  )}
                  {isTodayFollowUp && !isOverdue && 'Today'}
                  {!isOverdue && !isTodayFollowUp && format(followUp.date, 'MMM dd')}
                </p>
                <p className="text-xs text-muted-foreground">{followUp.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
