import { useState } from 'react';
import { Lead, LeadNote } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageSquare, Send, Edit2, Trash2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';

interface LeadNotesDialogProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
  onUpdateNotes: (leadId: string, notes: LeadNote[]) => void;
}

export function LeadNotesDialog({ open, onClose, lead, onUpdateNotes }: LeadNotesDialogProps) {
  const safeLead = lead || { id: '', name: '', notes: [] } as Lead;
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedNote, setEditedNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { activeTenant } = useTenant();
  const { toast } = useToast();

  const handleAddNote = async () => {
    if (!newNote.trim() || !lead || !user || !activeTenant) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('lead_notes')
        .insert({
          lead_id: lead.id,
          content: newNote.trim(),
          created_by: user.id,
          tenant_id: activeTenant.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newNoteObj: LeadNote = {
        id: data.id,
        content: data.content,
        createdAt: new Date(data.created_at),
        createdBy: data.created_by,
      };

      onUpdateNotes(lead.id, [newNoteObj, ...safeLead.notes]);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: 'Error',
        description: 'Failed to add note.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNote = (note: LeadNote) => {
    setEditingId(note.id);
    setEditedNote(note.content);
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editedNote.trim() || !lead) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('lead_notes')
        .update({ content: editedNote.trim() })
        .eq('id', noteId);

      if (error) throw error;

      const updatedNotes = safeLead.notes.map(n => 
        n.id === noteId ? { ...n, content: editedNote.trim() } : n
      );
      onUpdateNotes(lead.id, updatedNotes);
      setEditingId(null);
      setEditedNote('');
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to update note.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!lead) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('lead_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      const updatedNotes = safeLead.notes.filter(n => n.id !== noteId);
      onUpdateNotes(lead.id, updatedNotes);
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  return (
    <Dialog open={open && !!lead} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Notes for {safeLead.name}
          </DialogTitle>
        </DialogHeader>

        {/* Add New Note */}
        <div className="space-y-2 border-b border-border pb-4">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Add a note about this lead... (Press Enter to submit)"
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleAddNote} 
              disabled={!newNote.trim() || isSubmitting}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Add Note
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Previous Notes ({safeLead.notes?.length || 0})
          </h4>
          
          {(!safeLead.notes || safeLead.notes.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No notes yet</p>
              <p className="text-sm">Add your first note about this lead above</p>
            </div>
          ) : (
            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-3">
                {safeLead.notes.map((note) => (
                  <div 
                    key={note.id} 
                    className="bg-muted/50 rounded-lg p-3 group"
                  >
                    {editingId === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editedNote}
                          onChange={(e) => setEditedNote(e.target.value)}
                          className="min-h-[60px] resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleSaveEdit(note.id)}
                            disabled={!editedNote.trim() || isSubmitting}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {note.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {format(note.createdAt, 'MMM dd, yyyy HH:mm')}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => handleEditNote(note)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
