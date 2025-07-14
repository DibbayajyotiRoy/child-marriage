
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { InteractiveCard } from '@/components/ui/interactive-card';
import { AnimatedStats } from '@/components/ui/animated-stats';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMockData } from '@/hooks/useMockData';
import { caseService } from '@/api';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Shield,
  Heart,
  Bot,
  Plus,
  Settings
} from 'lucide-react';

export function OthersDashboard() {
  const { issues, reports } = useMockData();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Handle case where issues might be undefined initially
  const safeIssues = issues || [];
  const safeReports = reports || [];
  
  const activeCases = safeIssues.filter(c => c.status === 'active').length;
  const pendingCases = safeIssues.filter(c => c.status === 'pending').length;
  const resolvedCases = safeIssues.filter(c => c.status === 'resolved').length;
  const totalReports = safeReports.length;

  const handleAutoCreateTeam = async (caseId: string) => {
    try {
      await caseService.assignTeam(caseId, {
        teamId: "team-1",
        notes: "Auto-created team for urgent case"
      });
      console.log('Auto team created for case:', caseId);
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'cases', label: 'Active Cases', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const Sidebar = (
    <nav className="p-4">
      <div className="space-y-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === item.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Shield className="h-4 w-4" />
          Child Marriage Prevention System
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
          Protecting Our Future
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Advanced monitoring and response system for child marriage prevention initiatives
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InteractiveCard hover glow>
          <AnimatedStats
            value={activeCases}
            label="Active Cases"
            icon={<AlertTriangle className="h-5 w-5" />}
            trend="up"
            trendValue="+12%"
          />
        </InteractiveCard>
        
        <InteractiveCard hover glow>
          <AnimatedStats
            value={resolvedCases}
            label="Cases Resolved"
            icon={<CheckCircle className="h-5 w-5" />}
            trend="up"
            trendValue="+8%"
          />
        </InteractiveCard>
        
        <InteractiveCard hover glow>
          <AnimatedStats
            value={pendingCases}
            label="Pending Review"
            icon={<Clock className="h-5 w-5" />}
            trend="down"
            trendValue="-5%"
          />
        </InteractiveCard>
        
        <InteractiveCard hover glow>
          <AnimatedStats
            value={totalReports}
            label="Total Reports"
            icon={<FileText className="h-5 w-5" />}
            trend="up"
            trendValue="+15%"
          />
        </InteractiveCard>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Cases */}
        <InteractiveCard className="p-0">
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Recent Cases
              </h3>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {safeIssues.length} Total
              </Badge>
            </div>
          </div>
          
          <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
            {safeIssues.slice(0, 5).map((case_) => (
              <div key={case_.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="space-y-1">
                  <div className="font-medium text-sm">{case_.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {case_.location} • {case_.urgencyLevel} priority
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={case_.status === 'active' ? 'destructive' : 
                             case_.status === 'resolved' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {case_.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAutoCreateTeam(case_.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  >
                    <Bot className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </InteractiveCard>

        {/* Quick Actions */}
        <InteractiveCard className="p-0">
          <div className="p-6 border-b border-border/50">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Actions
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <Button className="w-full justify-start h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 transform hover:scale-[1.02]">
              <Plus className="h-4 w-4 mr-2" />
              Report New Case
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-12 hover:bg-accent/80 transition-all duration-200 transform hover:scale-[1.02]">
              <Bot className="h-4 w-4 mr-2" />
              Auto-Create Response Team
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-12 hover:bg-accent/80 transition-all duration-200 transform hover:scale-[1.02]">
              <Users className="h-4 w-4 mr-2" />
              Manage Teams
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-12 hover:bg-accent/80 transition-all duration-200 transform hover:scale-[1.02]">
              <FileText className="h-4 w-4 mr-2" />
              Generate Reports
            </Button>
          </div>
        </InteractiveCard>
      </div>

      {/* System Status */}
      <InteractiveCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">System Status</h3>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">All systems operational</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-600">&lt;50ms</div>
            <div className="text-sm text-muted-foreground">Response Time</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-muted-foreground">Monitoring</div>
          </div>
        </div>
      </InteractiveCard>
    </div>
  );

  const renderActiveCases = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Active Cases</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Case
        </Button>
      </div>
      <div className="grid gap-4">
        {safeIssues.filter(issue => issue.status === 'active').map((case_) => (
          <InteractiveCard key={case_.id} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{case_.title}</h3>
                <p className="text-muted-foreground">{case_.location}</p>
                <Badge variant="destructive" className="mt-2">{case_.status}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4" />
                  Assign Team
                </Button>
              </div>
            </div>
          </InteractiveCard>
        ))}
      </div>
    </div>
  );

  const renderTeams = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Response Teams</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Team
        </Button>
      </div>
      <div className="grid gap-4">
        <InteractiveCard className="p-6">
          <h3 className="text-lg font-semibold">Emergency Response Team Alpha</h3>
          <p className="text-muted-foreground">Active team handling urgent cases</p>
          <Badge variant="default" className="mt-2">Active</Badge>
        </InteractiveCard>
        <InteractiveCard className="p-6">
          <h3 className="text-lg font-semibold">Investigation Unit Beta</h3>
          <p className="text-muted-foreground">Specialized investigation team</p>
          <Badge variant="secondary" className="mt-2">Available</Badge>
        </InteractiveCard>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reports</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Generate Report
        </Button>
      </div>
      <div className="grid gap-4">
        {safeReports.map((report) => (
          <InteractiveCard key={report.id} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Report #{report.id}</h3>
                <p className="text-muted-foreground">Generated report</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Created: {report.createdAt.toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Report
              </Button>
            </div>
          </InteractiveCard>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <div className="grid gap-4">
        <InteractiveCard className="p-6">
          <h3 className="text-lg font-semibold">Notification Preferences</h3>
          <p className="text-muted-foreground">Configure how you receive alerts and updates</p>
          <Button variant="outline" className="mt-4">Configure</Button>
        </InteractiveCard>
        <InteractiveCard className="p-6">
          <h3 className="text-lg font-semibold">Security Settings</h3>
          <p className="text-muted-foreground">Manage your account security and permissions</p>
          <Button variant="outline" className="mt-4">Manage</Button>
        </InteractiveCard>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'cases':
        return renderActiveCases();
      case 'teams':
        return renderTeams();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <DashboardLayout
      title="Operations Dashboard"
      sidebar={Sidebar}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
