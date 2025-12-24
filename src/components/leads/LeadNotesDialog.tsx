import { useState } from 'react';
import { Lead } from '@/types/lead';
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

interface LeadNotesDialogProps {
  open: boolean;
  onClose: () => void;
  lead: Lead;
  onUpdateNotes: (leadId: string, notes: string[]) => void;
}

export function LeadNotesDialog({ open, onClose, lead, onUpdateNotes }: LeadNotesDialogProps) {
  const [newNote, setNewNote] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedNote, setEditedNote] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const timestamp = format(new Date(), 'MMM dd, yyyy HH:mm');
    const noteWithTimestamp = `[${timestamp}] ${newNote.trim()}`;
    const updatedNotes = [noteWithTimestamp, ...(lead.notes || [])];
    onUpdateNotes(lead.id, updatedNotes);
    setNewNote('');
  };

  const handleEditNote = (index: number) => {
    setEditingIndex(index);
    // Extract the note text without timestamp for editing
    const note = lead.notes[index];
    const match = note.match(/^\[.*?\]\s*(.*)/);
    setEditedNote(match ? match[1] : note);
  };

  const handleSaveEdit = (index: number) => {
    if (!editedNote.trim()) return;
    
    const timestamp = format(new Date(), 'MMM dd, yyyy HH:mm');
    const noteWithTimestamp = `[${timestamp}] ${editedNote.trim()} (edited)`;
    const updatedNotes = [...lead.notes];
    updatedNotes[index] = noteWithTimestamp;
    onUpdateNotes(lead.id, updatedNotes);
    setEditingIndex(null);
    setEditedNote('');
  };

  const handleDeleteNote = (index: number) => {
    const updatedNotes = lead.notes.filter((_, i) => i !== index);
    onUpdateNotes(lead.id, updatedNotes);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Notes for {lead.name}
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
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleAddNote} 
              disabled={!newNote.trim()}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Add Note
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 min-h-0">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Previous Notes ({lead.notes?.length || 0})
          </h4>
          
          {(!lead.notes || lead.notes.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No notes yet</p>
              <p className="text-sm">Add your first note about this lead above</p>
            </div>
          ) : (
            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-3">
                {lead.notes.map((note, index) => {
                  // Parse timestamp from note
                  const match = note.match(/^\[(.*?)\]\s*(.*)/);
                  const timestamp = match ? match[1] : '';
                  const noteText = match ? match[2] : note;
                  
                  return (
                    <div 
                      key={index} 
                      className="bg-muted/50 rounded-lg p-3 group"
                    >
                      {editingIndex === index ? (
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
                              onClick={() => setEditingIndex(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleSaveEdit(index)}
                              disabled={!editedNote.trim()}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {noteText}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {timestamp}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => handleEditNote(index)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteNote(index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
