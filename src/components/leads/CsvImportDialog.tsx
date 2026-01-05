import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lead, LeadStatus } from '@/types/lead';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CsvImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (leads: Lead[]) => void;
}

const SAMPLE_CSV = `name,email,phone,company,requirement,source,status,value
Rahul Sharma,rahul@example.com,9876543210,TechCorp India,Website Development,website,new,50000
Priya Patel,priya@business.com,9123456789,StartupXYZ,Mobile App,referral,contacted,150000
Amit Kumar,amit@gmail.com,8765432109,Digital Solutions,SEO Services,social,follow_up,25000
Sneha Reddy,sneha@company.co,7654321098,CloudTech,Cloud Migration,email,interested,200000
Vikram Singh,vikram@enterprise.in,6543210987,MegaCorp,ERP Implementation,cold-call,proposal_sent,500000`;

const VALID_SOURCES = ['website', 'referral', 'social', 'cold-call', 'email', 'advertisement', 'other'];
const VALID_STATUSES: LeadStatus[] = ['new', 'contacted', 'follow_up', 'interested', 'proposal_sent', 'won', 'lost'];

export function CsvImportDialog({ open, onClose, onImport }: CsvImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedLeads, setParsedLeads] = useState<Lead[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sample_leads.csv';
    link.click();
    toast({
      title: 'Sample Downloaded',
      description: 'Fill in the sample CSV and upload it to import leads.',
    });
  };

  const parseCSV = (text: string): { leads: Lead[]; errors: string[] } => {
    const lines = text.trim().split('\n');
    const leads: Lead[] = [];
    const parseErrors: string[] = [];

    if (lines.length < 2) {
      return { leads: [], errors: ['CSV file is empty or has no data rows'] };
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const requiredHeaders = ['name', 'email', 'phone', 'requirement', 'source', 'value'];
    
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        parseErrors.push(`Missing required column: ${required}`);
      }
    }

    if (parseErrors.length > 0) {
      return { leads: [], errors: parseErrors };
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Validate required fields
      if (!row.name || !row.email || !row.phone || !row.requirement) {
        parseErrors.push(`Row ${i + 1}: Missing required fields (name, email, phone, requirement)`);
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        parseErrors.push(`Row ${i + 1}: Invalid email format`);
        continue;
      }

      // Validate and normalize source
      let source = 'other';
      if (row.source) {
        const normalizedSource = row.source.toLowerCase().replace(/\s+/g, '-');
        if (VALID_SOURCES.includes(normalizedSource)) {
          source = normalizedSource;
        }
      }

      // Validate and normalize status
      let status: LeadStatus = 'new';
      if (row.status) {
        const normalizedStatus = row.status.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_') as LeadStatus;
        if (VALID_STATUSES.includes(normalizedStatus)) {
          status = normalizedStatus;
        }
      }

      // Parse value
      const value = parseInt(row.value) || 0;

      const lead: Lead = {
        id: `lead-csv-${Date.now()}-${i}`,
        name: row.name,
        email: row.email,
        phone: row.phone,
        company: row.company || null,
        requirement: row.requirement,
        source,
        status,
        value,
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: [],
      };

      leads.push(lead);
    }

    return { leads, errors: parseErrors };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const text = await selectedFile.text();
      const { leads, errors: parseErrors } = parseCSV(text);
      setParsedLeads(leads);
      setErrors(parseErrors);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to read CSV file.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (parsedLeads.length === 0) return;
    
    onImport(parsedLeads);
    toast({
      title: '🎉 Import Successful',
      description: `${parsedLeads.length} leads imported successfully.`,
    });
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setParsedLeads([]);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Import Leads from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import leads. Download the sample file to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Sample Button */}
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleDownloadSample}
          >
            <Download className="h-4 w-4" />
            Download Sample CSV
          </Button>

          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            
            {!file ? (
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">Click to upload CSV</p>
                <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
              </label>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setFile(null);
                      setParsedLeads([]);
                      setErrors([]);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="text-center text-sm text-muted-foreground">
              Processing file...
            </div>
          )}

          {/* Parsed Results */}
          {parsedLeads.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-success">
                {parsedLeads.length} leads ready to import
              </span>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Errors found:</span>
              </div>
              <ScrollArea className="h-24 rounded border p-2">
                <ul className="text-xs text-destructive space-y-1">
                  {errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}

          {/* Preview */}
          {parsedLeads.length > 0 && (
            <ScrollArea className="h-40 rounded border">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Value</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedLeads.slice(0, 10).map((lead, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{lead.name}</td>
                      <td className="p-2">{lead.email}</td>
                      <td className="p-2">₹{lead.value.toLocaleString()}</td>
                      <td className="p-2 capitalize">{lead.status.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedLeads.length > 10 && (
                <p className="text-xs text-muted-foreground text-center p-2">
                  ...and {parsedLeads.length - 10} more
                </p>
              )}
            </ScrollArea>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleImport}
              disabled={parsedLeads.length === 0}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import {parsedLeads.length > 0 && `(${parsedLeads.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
