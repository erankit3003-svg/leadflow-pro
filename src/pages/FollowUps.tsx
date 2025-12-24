import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { mockFollowUps, mockLeads } from '@/data/mockData';
import { FollowUp } from '@/types/lead';
import { format, isToday, isPast, isTomorrow } from 'date-fns';
import { Phone, Mail, Video, MessageCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const typeIcons = {
  call: Phone,
  email: Mail,
  meeting: Video,
  whatsapp: MessageCircle,
};

const typeLabels = {
  call: 'Call',
  email: 'Email',
  meeting: 'Meeting',
  whatsapp: 'WhatsApp',
};

export default function FollowUps() {
  const [followUps, setFollowUps] = useState<FollowUp[]>(mockFollowUps);
  const { toast } = useToast();

  const overdueFollowUps = followUps.filter(
    (f) => !f.completed && isPast(f.date) && !isToday(f.date)
  );
  const todayFollowUps = followUps.filter(
    (f) => !f.completed && isToday(f.date)
  );
  const upcomingFollowUps = followUps.filter(
    (f) => !f.completed && !isPast(f.date) && !isToday(f.date)
  );
  const completedFollowUps = followUps.filter((f) => f.completed);

  const handleToggleComplete = (id: string) => {
    setFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, completed: !f.completed } : f))
    );
    toast({
      title: 'Follow-up Updated',
      description: 'Follow-up status has been changed.',
    });
  };

  const renderFollowUpCard = (followUp: FollowUp, variant: 'overdue' | 'today' | 'upcoming' | 'completed') => {
    const lead = mockLeads.find((l) => l.id === followUp.leadId);
    const Icon = typeIcons[followUp.type];

    const variantStyles = {
      overdue: 'border-destructive/30 bg-destructive/5',
      today: 'border-warning/30 bg-warning/5',
      upcoming: 'border-border bg-card',
      completed: 'border-border bg-muted/50 opacity-60',
    };

    const iconStyles = {
      overdue: 'bg-destructive/10 text-destructive',
      today: 'bg-warning/10 text-warning',
      upcoming: 'bg-primary/10 text-primary',
      completed: 'bg-muted text-muted-foreground',
    };

    return (
      <div
        key={followUp.id}
        className={cn(
          'flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm',
          variantStyles[variant]
        )}
      >
        <Checkbox
          checked={followUp.completed}
          onCheckedChange={() => handleToggleComplete(followUp.id)}
          className="h-5 w-5"
        />
        
        <div className={cn('p-2.5 rounded-lg', iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{lead?.name || 'Unknown Lead'}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {typeLabels[followUp.type]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">{followUp.notes}</p>
          {lead?.company && (
            <p className="text-xs text-muted-foreground mt-1">{lead.company}</p>
          )}
        </div>

        <div className="text-right">
          <p className="text-sm font-medium text-foreground">
            {format(followUp.date, 'MMM dd, yyyy')}
          </p>
          <p className="text-sm text-muted-foreground">{followUp.time}</p>
        </div>

        <Button asChild variant="ghost" size="sm" className="text-primary">
          <Link to="/leads">View Lead</Link>
        </Button>
      </div>
    );
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    items: FollowUp[],
    variant: 'overdue' | 'today' | 'upcoming' | 'completed'
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-foreground">{title}</h3>
          <span className="text-sm text-muted-foreground">({items.length})</span>
        </div>
        <div className="space-y-3">
          {items.map((followUp) => renderFollowUpCard(followUp, variant))}
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <Header
        title="Follow-ups"
        subtitle="Manage your scheduled follow-ups"
        onAddNew={() => {}}
        addNewLabel="Schedule Follow-up"
      />

      <div className="p-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{overdueFollowUps.length}</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{todayFollowUps.length}</p>
              <p className="text-sm text-muted-foreground">Due Today</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{upcomingFollowUps.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedFollowUps.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>

        {/* Follow-up Lists */}
        <div className="space-y-8">
          {renderSection(
            'Overdue',
            <AlertTriangle className="h-5 w-5 text-destructive" />,
            overdueFollowUps,
            'overdue'
          )}
          {renderSection(
            'Today',
            <Clock className="h-5 w-5 text-warning" />,
            todayFollowUps,
            'today'
          )}
          {renderSection(
            'Upcoming',
            <Phone className="h-5 w-5 text-primary" />,
            upcomingFollowUps,
            'upcoming'
          )}
          {renderSection(
            'Completed',
            <CheckCircle2 className="h-5 w-5 text-success" />,
            completedFollowUps,
            'completed'
          )}
        </div>

        {followUps.length === 0 && (
          <div className="text-center py-12">
            <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No follow-ups scheduled</h3>
            <p className="text-muted-foreground mb-4">
              Schedule follow-ups to stay on top of your leads.
            </p>
            <Button className="gradient-primary border-0">Schedule Follow-up</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
