import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { LeadSourceChart } from '@/components/dashboard/LeadSourceChart';
import { RecentLeads } from '@/components/dashboard/RecentLeads';
import { UpcomingFollowUps } from '@/components/dashboard/UpcomingFollowUps';
import { mockLeads, mockFollowUps } from '@/data/mockData';
import { Users, TrendingUp, DollarSign, Target, Calendar, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const totalLeads = mockLeads.length;
  const wonLeads = mockLeads.filter(l => l.status === 'won');
  const totalRevenue = wonLeads.reduce((sum, l) => sum + l.value, 0);
  const conversionRate = Math.round((wonLeads.length / totalLeads) * 100);
  const activeFollowUps = mockFollowUps.filter(f => !f.completed).length;

  return (
    <MainLayout>
      <Header 
        title="Dashboard" 
        subtitle="Welcome back! Here's your sales overview."
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Leads"
            value={totalLeads}
            change="+12% from last month"
            changeType="positive"
            icon={Users}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
            change="+8% from last month"
            changeType="positive"
            icon={DollarSign}
            iconColor="text-success"
            iconBgColor="bg-success/10"
          />
          <StatCard
            title="Conversion Rate"
            value={`${conversionRate}%`}
            change="+2% from last month"
            changeType="positive"
            icon={Target}
            iconColor="text-accent"
            iconBgColor="bg-accent/10"
          />
          <StatCard
            title="Pending Follow-ups"
            value={activeFollowUps}
            change="3 due today"
            changeType="neutral"
            icon={Calendar}
            iconColor="text-warning"
            iconBgColor="bg-warning/10"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <LeadSourceChart />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentLeads leads={mockLeads} />
          <UpcomingFollowUps followUps={mockFollowUps} />
        </div>
      </div>
    </MainLayout>
  );
}
