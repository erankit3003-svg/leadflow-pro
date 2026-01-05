import { Bell, Search, Plus, Building2, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
}

export function Header({ title, subtitle, onAddNew, addNewLabel = 'Add New' }: HeaderProps) {
  const { toast } = useToast();
  const { tenants, activeTenant, setActiveTenant, loading } = useTenant();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="flex items-center gap-4">
        {/* Tenant Switcher */}
        {tenants.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[180px] justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate max-w-[120px]">
                    {loading ? 'Loading...' : activeTenant?.name || 'Select Company'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px]">
              <DropdownMenuLabel>Switch Company</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tenants.map((tenant) => (
                <DropdownMenuItem
                  key={tenant.id}
                  onClick={() => setActiveTenant(tenant)}
                  className={cn(
                    'cursor-pointer',
                    activeTenant?.id === tenant.id && 'bg-accent'
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium">{tenant.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {tenant.role.replace('_', ' ')}
                      </span>
                    </div>
                    {activeTenant?.id === tenant.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search leads..."
            className="w-64 pl-9 bg-secondary border-0"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() =>
            toast({
              title: 'Notifications',
              description: 'Notifications panel will be added next.',
            })
          }
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            2
          </span>
        </Button>

        {/* Add New Button */}
        {onAddNew && (
          <Button onClick={onAddNew} className="gradient-primary border-0">
            <Plus className="h-4 w-4 mr-2" />
            {addNewLabel}
          </Button>
        )}
      </div>
    </header>
  );
}
