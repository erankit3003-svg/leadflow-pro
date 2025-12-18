import { useState } from 'react';
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
import { Lead, LeadStatus } from '@/types/lead';
import { mockLeads } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const PIPELINE_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'follow-up',
  'interested',
  'proposal',
  'won',
  'lost',
];

export default function Pipeline() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, status: newStatus, updatedAt: new Date() }
          : lead
      )
    );

    toast({
      title: 'Lead Updated',
      description: `Lead moved to ${newStatus.replace('-', ' ')} stage.`,
    });
  };

  const handleAddLead = () => {
    setEditingLead(undefined);
    setIsFormOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    toast({
      title: 'Lead Deleted',
      description: 'The lead has been removed.',
      variant: 'destructive',
    });
  };

  const handleSubmitLead = (leadData: Partial<Lead>) => {
    if (editingLead) {
      setLeads((prev) =>
        prev.map((l) => (l.id === editingLead.id ? { ...l, ...leadData } as Lead : l))
      );
      toast({
        title: 'Lead Updated',
        description: 'Lead information has been updated.',
      });
    } else {
      setLeads((prev) => [...prev, leadData as Lead]);
      toast({
        title: 'Lead Created',
        description: 'New lead has been added to the pipeline.',
      });
    }
  };

  return (
    <MainLayout>
      <Header
        title="Sales Pipeline"
        subtitle="Drag and drop leads to update their status"
        onAddNew={handleAddLead}
        addNewLabel="Add Lead"
      />

      <div className="p-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {PIPELINE_STATUSES.map((status) => (
              <PipelineColumn
                key={status}
                status={status}
                leads={leads.filter((l) => l.status === status)}
                onEditLead={handleEditLead}
                onDeleteLead={handleDeleteLead}
              />
            ))}
          </div>

          <DragOverlay>
            {activeLead ? <LeadCard lead={activeLead} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <LeadForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitLead}
        lead={editingLead}
      />
    </MainLayout>
  );
}
