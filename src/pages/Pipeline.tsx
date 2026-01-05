import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { PipelineColumn } from '@/components/leads/PipelineColumn';
import { LeadCard } from '@/components/leads/LeadCard';
import { LeadForm } from '@/components/leads/LeadForm';
import { LeadDetailDrawer } from '@/components/leads/LeadDetailDrawer';
import { LeadNotesDialog } from '@/components/leads/LeadNotesDialog';
import { Lead, LeadStatus, LeadNote, STATUS_CONFIG } from '@/types/lead';
import { useLeads } from '@/contexts/LeadsContext';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, IndianRupee, Target, ArrowRight, Filter, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router-dom';

const PIPELINE_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'follow_up',
  'interested',
  'proposal_sent',
  'won',
  'lost',
];

export default function Pipeline() {
  const { leads, loading, updateLead, updateNotes, addLead, deleteLead } = useLeads();
  const { activeTenant } = useTenant();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();
  const [defaultStatus, setDefaultStatus] = useState<LeadStatus>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notesLeadId, setNotesLeadId] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;
  const notesLead = notesLeadId ? leads.find((l) => l.id === notesLeadId) || null : null;

  // Calculate pipeline stats
  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const totalValue = leads.reduce((sum, l) => sum + l.value, 0);
    const wonValue = leads.filter(l => l.status === 'won').reduce((sum, l) => sum + l.value, 0);
    const conversionRate = totalLeads > 0 
      ? ((leads.filter(l => l.status === 'won').length / totalLeads) * 100).toFixed(1)
      : '0';
    const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.status)).length;

    return { totalLeads, totalValue, wonValue, conversionRate, activeLeads };
  }, [leads]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = searchQuery === '' || 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.company?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (lead.requirement?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const matchesSource = filterSource === 'all' || lead.source === filterSource;
      
      return matchesSearch && matchesSource;
    });
  }, [leads, searchQuery, filterSource]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;

    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    try {
      await updateLead(leadId, { status: newStatus });
      toast({
        title: '🎯 Lead Updated',
        description: `${lead.name} moved to ${STATUS_CONFIG[newStatus].label}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lead status.',
        variant: 'destructive',
      });
    }
  };

  const handleAddLead = (status?: LeadStatus) => {
    setEditingLead(undefined);
    setDefaultStatus(status || 'new');
    setIsFormOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
      toast({
        title: 'Lead Deleted',
        description: 'The lead has been removed.',
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete lead.',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleViewNotes = (lead: Lead) => {
    setNotesLeadId(lead.id);
    setSelectedLead(null);
  };

  const handleUpdateNotes = (leadId: string, notes: LeadNote[]) => {
    updateNotes(leadId, notes);
  };

  const handleSubmitLead = async (leadData: Partial<Lead>) => {
    try {
      if (editingLead) {
        await updateLead(editingLead.id, leadData);
        toast({
          title: 'Lead Updated',
          description: 'Lead information has been updated.',
        });
      } else {
        await addLead({
          name: leadData.name || '',
          email: leadData.email || null,
          phone: leadData.phone || null,
          company: leadData.company || null,
          companyId: null,
          tenantId: activeTenant?.id || null,
          requirement: leadData.requirement || null,
          source: leadData.source || null,
          value: leadData.value || 0,
          status: defaultStatus,
          assignedTo: leadData.assignedTo || null,
          followUpDate: leadData.followUpDate || null,
          createdBy: null,
          wonReason: null,
          lostReason: null,
        });
        toast({
          title: '🎉 Lead Created',
          description: 'New lead has been added to the pipeline.',
        });
      }
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save lead.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!activeTenant) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <p className="text-muted-foreground">Please select or create a company to manage leads.</p>
          <Link to="/companies">
            <Button>Go to Companies</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header
        title="Sales Pipeline"
        subtitle="Drag and drop leads to move them through your sales process"
        onAddNew={() => handleAddLead()}
        addNewLabel="Add Lead"
      />

      <div className="p-6 space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalLeads}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold text-foreground">₹{(stats.totalValue / 100000).toFixed(1)}L</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Won Revenue</p>
                <p className="text-2xl font-bold text-foreground">₹{(stats.wonValue / 100000).toFixed(1)}L</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
              <SelectItem value="cold-call">Cold Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="advertisement">Advertisement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pipeline Board */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
            {PIPELINE_STATUSES.map((status) => (
              <PipelineColumn
                key={status}
                status={status}
                leads={filteredLeads.filter((l) => l.status === status)}
                onEditLead={handleEditLead}
                onDeleteLead={handleDeleteLead}
                onAddLead={handleAddLead}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          <DragOverlay>
            {activeLead ? <LeadCard lead={activeLead} /> : null}
          </DragOverlay>
        </DndContext>

        {/* Quick Tip */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Pro Tip</p>
              <p className="text-xs text-muted-foreground">
                Drag and drop leads between columns to update their status. Click the + button on any column to add a new lead directly to that stage.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <LeadForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitLead}
        lead={editingLead}
      />

      <LeadDetailDrawer
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onEdit={(lead) => {
          setSelectedLead(null);
          handleEditLead(lead);
        }}
        onViewNotes={handleViewNotes}
      />

      <LeadNotesDialog
        lead={notesLead}
        open={!!notesLead}
        onClose={() => setNotesLeadId(null)}
        onUpdateNotes={handleUpdateNotes}
      />
    </MainLayout>
  );
}
