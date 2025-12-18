import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { FileText, DollarSign, Clock, CheckCircle, AlertTriangle, MoreHorizontal, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [invoices] = useState<Invoice[]>(mockInvoices);

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
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
    </MainLayout>
  );
}
