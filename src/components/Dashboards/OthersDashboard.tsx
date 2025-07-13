
import React from 'react';
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
  Plus
} from 'lucide-react';

export function OthersDashboard() {
  const { cases, reports } = useMockData();
  
  const activeCases = cases.filter(c => c.status === 'active').length;
  const pendingCases = cases.filter(c => c.status === 'pending').length;
  const resolvedCases = cases.filter(c => c.status === 'resolved').length;
  const totalReports = reports.length;

  const handleAutoCreateTeam = async (caseId: string) => {
    try {
      await caseService.assignTeam(caseId, {
        leaderId: "person-1",
        memberIds: ["person-2", "person-3"]
      });
      console.log('Auto team created for case:', caseId);
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  return (
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
                {cases.length} Total
              </Badge>
            </div>
          </div>
          
          <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
            {cases.slice(0, 5).map((case_) => (
              <div key={case_.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="space-y-1">
                  <div className="font-medium text-sm">{case_.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {case_.location} • {case_.urgency} priority
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
}
