import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { LeadForm } from '@/components/leads/LeadForm';
import { LeadNotesDialog } from '@/components/leads/LeadNotesDialog';
import { CsvImportDialog } from '@/components/leads/CsvImportDialog';
import { Lead, LeadStatus, STATUS_CONFIG } from '@/types/lead';
import { useLeads } from '@/contexts/LeadsContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Download, LayoutGrid, List, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function Leads() {
  const { leads, setLeads, updateNotes, addLead, deleteLead } = useLeads();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();
  const [notesLeadId, setNotesLeadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const { toast } = useToast();

  const notesLead = notesLeadId ? leads.find((l) => l.id === notesLeadId) || null : null;

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddLead = () => {
    setEditingLead(undefined);
    setIsFormOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleDeleteLead = (leadId: string) => {
    deleteLead(leadId);
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
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        ...leadData,
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: [],
      } as Lead;
      addLead(newLead);
      toast({
        title: 'Lead Created',
        description: 'New lead has been added.',
      });
    }
  };

  const handleViewNotes = (lead: Lead) => {
    setNotesLeadId(lead.id);
  };

  const handleUpdateNotes = (leadId: string, notes: Lead['notes']) => {
    updateNotes(leadId, notes);
    toast({
      title: 'Notes Updated',
      description: 'Lead notes have been saved.',
    });
  };

  const handleImportLeads = (importedLeads: Lead[]) => {
    importedLeads.forEach(lead => addLead(lead));
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Value', 'Source'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        `"${lead.name}"`,
        `"${lead.email}"`,
        `"${lead.phone}"`,
        `"${lead.company || ''}"`,
        lead.status,
        lead.value,
        lead.source
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'leads_export.csv';
    link.click();
    
    toast({
      title: 'Export Complete',
      description: `${filteredLeads.length} leads exported to CSV.`,
    });
  };

  return (
    <MainLayout>
      <Header
        title="Leads"
        subtitle={`${filteredLeads.length} total leads`}
        onAddNew={handleAddLead}
        addNewLabel="Add Lead"
      />

      <div className="p-6 space-y-6">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as LeadStatus | 'all')}
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsCsvImportOpen(true)} className="gap-1">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import CSV</span>
            </Button>
            <Button variant="outline" size="icon" onClick={handleExportCSV} title="Export to CSV">
              <Download className="h-4 w-4" />
            </Button>
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button variant="ghost" size="icon" className="rounded-none border-r border-border bg-accent" aria-label="Table view">
                <List className="h-4 w-4" />
              </Button>
              <Button asChild variant="ghost" size="icon" className="rounded-none" aria-label="Pipeline view">
                <Link to="/pipeline">
                  <LayoutGrid className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <LeadsTable
          leads={filteredLeads}
          onEdit={handleEditLead}
          onDelete={handleDeleteLead}
          onViewNotes={handleViewNotes}
        />
      </div>

      <LeadForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitLead}
        lead={editingLead}
      />

      <LeadNotesDialog
        lead={notesLead}
        open={!!notesLead}
        onClose={() => setNotesLeadId(null)}
        onUpdateNotes={handleUpdateNotes}
      />

      <CsvImportDialog
        open={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onImport={handleImportLeads}
      />
    </MainLayout>
  );
}
