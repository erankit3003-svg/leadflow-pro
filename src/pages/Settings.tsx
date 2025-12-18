import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building, Bell, Shield, Palette, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: 'Amit Kumar',
    email: 'amit@leadflow.com',
    phone: '+91 98765 43210',
    role: 'Admin',
  });

  const [company, setCompany] = useState({
    name: 'LeadFlow CRM',
    website: 'https://leadflow.com',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    dailyDigest: false,
    leadAssignment: true,
    followUpReminders: true,
  });

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been updated successfully.',
    });
  };

  return (
    <MainLayout>
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <div className="p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-background">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="company" className="data-[state=active]:bg-background">
              <Building className="h-4 w-4 mr-2" />
              Company
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-background">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="customization" className="data-[state=active]:bg-background">
              <Palette className="h-4 w-4 mr-2" />
              Customization
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="stat-card max-w-2xl">
              <h3 className="text-lg font-semibold text-foreground mb-6">Profile Information</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">AK</span>
                  </div>
                  <Button variant="outline">Change Avatar</Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value={profile.role} disabled />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button onClick={handleSave} className="gradient-primary border-0">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company">
            <div className="stat-card max-w-2xl">
              <h3 className="text-lg font-semibold text-foreground mb-6">Company Settings</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={company.name}
                      onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={company.website}
                      onChange={(e) => setCompany({ ...company, website: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={company.currency}
                      onValueChange={(value) => setCompany({ ...company, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={company.timezone}
                      onValueChange={(value) => setCompany({ ...company, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button onClick={handleSave} className="gradient-primary border-0">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="stat-card max-w-2xl">
              <h3 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, pushNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Daily Digest</p>
                    <p className="text-sm text-muted-foreground">Get a daily summary of activities</p>
                  </div>
                  <Switch
                    checked={notifications.dailyDigest}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, dailyDigest: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Lead Assignment</p>
                    <p className="text-sm text-muted-foreground">Notify when leads are assigned to you</p>
                  </div>
                  <Switch
                    checked={notifications.leadAssignment}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, leadAssignment: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-foreground">Follow-up Reminders</p>
                    <p className="text-sm text-muted-foreground">Get reminded about upcoming follow-ups</p>
                  </div>
                  <Switch
                    checked={notifications.followUpReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, followUpReminders: checked })
                    }
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <Button onClick={handleSave} className="gradient-primary border-0">
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Customization Tab */}
          <TabsContent value="customization">
            <div className="stat-card max-w-2xl">
              <h3 className="text-lg font-semibold text-foreground mb-6">Customization</h3>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Lead Sources</h4>
                  <p className="text-sm text-muted-foreground">
                    Customize the available lead sources for your organization.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Website', 'Referral', 'Social Media', 'Cold Call', 'Email', 'Advertisement'].map(
                      (source) => (
                        <span
                          key={source}
                          className="px-3 py-1.5 rounded-lg bg-muted text-sm text-foreground"
                        >
                          {source}
                        </span>
                      )
                    )}
                    <Button variant="outline" size="sm">
                      + Add Source
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground">Lead Statuses</h4>
                  <p className="text-sm text-muted-foreground">
                    Customize the pipeline stages for your sales process.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['New', 'Contacted', 'Follow-Up', 'Interested', 'Proposal Sent', 'Won', 'Lost'].map(
                      (status) => (
                        <span
                          key={status}
                          className="px-3 py-1.5 rounded-lg bg-muted text-sm text-foreground"
                        >
                          {status}
                        </span>
                      )
                    )}
                    <Button variant="outline" size="sm">
                      + Add Status
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button onClick={handleSave} className="gradient-primary border-0">
                    Save Customization
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
