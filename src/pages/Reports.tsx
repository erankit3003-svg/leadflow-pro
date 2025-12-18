import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { mockLeads } from '@/data/mockData';
import { STATUS_CONFIG, SOURCE_CONFIG } from '@/types/lead';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Reports() {
  // Calculate stats
  const totalLeads = mockLeads.length;
  const wonLeads = mockLeads.filter((l) => l.status === 'won');
  const lostLeads = mockLeads.filter((l) => l.status === 'lost');
  const totalRevenue = wonLeads.reduce((sum, l) => sum + l.value, 0);
  const lostRevenue = lostLeads.reduce((sum, l) => sum + l.value, 0);
  const conversionRate = Math.round((wonLeads.length / totalLeads) * 100);

  // Status distribution data
  const statusData = Object.entries(STATUS_CONFIG).map(([key, config]) => ({
    name: config.label,
    value: mockLeads.filter((l) => l.status === key).length,
    color: key === 'won' ? 'hsl(158, 64%, 42%)' : 
           key === 'lost' ? 'hsl(0, 84%, 60%)' : 
           'hsl(234, 89%, 54%)',
  }));

  // Source performance data
  const sourceData = Object.entries(SOURCE_CONFIG).map(([key, config]) => {
    const sourceLeads = mockLeads.filter((l) => l.source === key);
    const sourceWon = sourceLeads.filter((l) => l.status === 'won');
    return {
      name: config.label,
      leads: sourceLeads.length,
      won: sourceWon.length,
      revenue: sourceWon.reduce((sum, l) => sum + l.value, 0),
    };
  }).filter(d => d.leads > 0);

  // Monthly trend data
  const monthlyData = [
    { month: 'Jan', leads: 24, won: 4, revenue: 420000 },
    { month: 'Feb', leads: 21, won: 3, revenue: 380000 },
    { month: 'Mar', leads: 32, won: 6, revenue: 520000 },
    { month: 'Apr', leads: 28, won: 5, revenue: 490000 },
    { month: 'May', leads: 38, won: 8, revenue: 650000 },
    { month: 'Jun', leads: 42, won: 9, revenue: 720000 },
  ];

  // Team performance data
  const teamData = [
    { name: 'Amit Kumar', leads: 42, won: 8, revenue: 980000, conversion: 19 },
    { name: 'Sneha Gupta', leads: 38, won: 7, revenue: 850000, conversion: 18 },
    { name: 'Raj Patel', leads: 35, won: 5, revenue: 620000, conversion: 14 },
  ];

  return (
    <MainLayout>
      <Header title="Reports & Analytics" subtitle="Track your sales performance" />

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <span className="flex items-center text-sm text-success">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12%
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalLeads}</p>
            <p className="text-sm text-muted-foreground">Total Leads</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <span className="flex items-center text-sm text-success">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8%
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">₹{(totalRevenue / 100000).toFixed(1)}L</p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <span className="flex items-center text-sm text-success">
                <TrendingUp className="h-4 w-4 mr-1" />
                +2%
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">{conversionRate}%</p>
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">₹{(lostRevenue / 100000).toFixed(1)}L</p>
            <p className="text-sm text-muted-foreground">Lost Revenue</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <div className="stat-card h-[400px]">
            <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Performance</h3>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="hsl(234, 89%, 54%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(234, 89%, 54%)', strokeWidth: 2 }}
                  name="Leads"
                />
                <Line
                  type="monotone"
                  dataKey="won"
                  stroke="hsl(158, 64%, 42%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(158, 64%, 42%)', strokeWidth: 2 }}
                  name="Won"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Source Performance */}
          <div className="stat-card h-[400px]">
            <h3 className="text-lg font-semibold text-foreground mb-4">Lead Source Performance</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={sourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="leads" fill="hsl(234, 89%, 54%)" radius={[0, 4, 4, 0]} name="Leads" />
                <Bar dataKey="won" fill="hsl(158, 64%, 42%)" radius={[0, 4, 4, 0]} name="Won" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Performance */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Team Performance</h3>
            <Award className="h-5 w-5 text-warning" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Team Member</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Leads</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Won</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {teamData.map((member, index) => (
                  <tr key={member.name} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          {index === 0 && (
                            <span className="text-xs text-warning">Top Performer</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-4 px-4 font-medium text-foreground">{member.leads}</td>
                    <td className="text-right py-4 px-4 font-medium text-success">{member.won}</td>
                    <td className="text-right py-4 px-4 font-medium text-foreground">
                      ₹{(member.revenue / 100000).toFixed(1)}L
                    </td>
                    <td className="text-right py-4 px-4">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        member.conversion >= 18 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      )}>
                        {member.conversion}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
