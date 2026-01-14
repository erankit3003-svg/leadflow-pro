import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { FileText, DollarSign, Clock, CheckCircle, AlertTriangle, MoreHorizontal, Download, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  company: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: Date;
  createdAt: Date;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    clientName: 'Neha Kapoor',
    company: 'HealthTech Solutions',
    amount: 520000,
    status: 'paid',
    dueDate: new Date('2024-01-20'),
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    clientName: 'Karan Mehta',
    company: 'Builders Group',
    amount: 380000,
    status: 'pending',
    dueDate: addDays(new Date(), 5),
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    clientName: 'Ananya Reddy',
    company: 'FinancePlus',
    amount: 250000,
    status: 'overdue',
    dueDate: new Date('2024-01-10'),
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    clientName: 'Vikram Singh',
    company: 'Global Retail Ltd',
    amount: 180000,
    status: 'pending',
    dueDate: addDays(new Date(), 10),
    createdAt: new Date('2024-01-12'),
  },
];

const statusConfig = {
  paid: { label: 'Paid', color: 'text-success', bgColor: 'bg-success/10', icon: CheckCircle },
  pending: { label: 'Pending', color: 'text-warning', bgColor: 'bg-warning/10', icon: Clock },
  overdue: { label: 'Overdue', color: 'text-destructive', bgColor: 'bg-destructive/10', icon: AlertTriangle },
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, 28);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.invoiceNumber, pageWidth - 20, 28, { align: 'right' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Invoice details section
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Invoice Date:', 20, 55);
    doc.text('Due Date:', 20, 65);
    doc.text('Status:', 20, 75);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(format(invoice.createdAt, 'MMMM dd, yyyy'), 70, 55);
    doc.text(format(invoice.dueDate, 'MMMM dd, yyyy'), 70, 65);
    
    // Status with color
    const statusColors: Record<string, [number, number, number]> = {
      paid: [34, 197, 94],
      pending: [234, 179, 8],
      overdue: [239, 68, 68],
    };
    const statusColor = statusColors[invoice.status] || [0, 0, 0];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusConfig[invoice.status].label.toUpperCase(), 70, 75);
    
    // Bill To section
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('BILL TO:', 20, 95);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.clientName, 20, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(invoice.company, 20, 113);
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 130, pageWidth - 20, 130);
    
    // Amount section
    doc.setFillColor(249, 250, 251);
    doc.rect(20, 140, pageWidth - 40, 30, 'F');
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text('Amount Due', 30, 155);
    
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${invoice.amount.toLocaleString()}`, pageWidth - 30, 158, { align: 'right' });
    
    // Footer
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', pageWidth / 2, 200, { align: 'center' });
    
    // Line at bottom
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 280, pageWidth, 17, 'F');
    
    // Save the PDF
    doc.save(`${invoice.invoiceNumber}.pdf`);
    
    toast.success(`Downloaded ${invoice.invoiceNumber}.pdf`);
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'paid' as const } : inv
    ));
    toast.success('Invoice marked as paid');
  };

  const handleSendReminder = (invoice: Invoice) => {
    toast.success(`Reminder sent to ${invoice.clientName}`);
  };

  return (
    <MainLayout>
      <Header
        title="Invoices"
        subtitle="Manage your invoices and payments"
        onAddNew={() => {}}
        addNewLabel="Create Invoice"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹{(totalAmount / 100000).toFixed(1)}L</p>
                <p className="text-sm text-muted-foreground">Total Invoiced</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹{(paidAmount / 100000).toFixed(1)}L</p>
                <p className="text-sm text-muted-foreground">Paid</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹{(pendingAmount / 100000).toFixed(1)}L</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹{(overdueAmount / 100000).toFixed(1)}L</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Invoice</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Client</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Due Date</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const config = statusConfig[invoice.status];
                const StatusIcon = config.icon;

                return (
                  <tr key={invoice.id} className="border-t border-border hover:bg-muted/30">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(invoice.createdAt, 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-foreground">{invoice.clientName}</p>
                      <p className="text-sm text-muted-foreground">{invoice.company}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-foreground">₹{invoice.amount.toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn('status-badge', config.bgColor, config.color)}>
                        <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                        {config.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-foreground">{format(invoice.dueDate, 'MMM dd, yyyy')}</p>
                    </td>
                    <td className="py-4 px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendReminder(invoice)}>
                            Send Reminder
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                            Mark as Paid
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Number</span>
                  <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client</span>
                  <span className="font-medium">{selectedInvoice.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company</span>
                  <span className="font-medium">{selectedInvoice.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-primary">₹{selectedInvoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={cn('status-badge', statusConfig[selectedInvoice.status].bgColor, statusConfig[selectedInvoice.status].color)}>
                    {statusConfig[selectedInvoice.status].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(selectedInvoice.createdAt, 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span>{format(selectedInvoice.dueDate, 'MMM dd, yyyy')}</span>
                </div>
              </div>
              <Button onClick={() => handleDownloadPDF(selectedInvoice)} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
