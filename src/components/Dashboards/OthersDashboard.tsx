
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useMockData } from '@/hooks/useMockData';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Monitor, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function OthersDashboard() {
  const { user } = useAuth();
  const { issues, teams, persons, setTeams } = useMockData();
  const [activeTab, setActiveTab] = useState('monitoring');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [teamName, setTeamName] = useState('');

  const unassignedIssues = issues.filter(issue => !issue.assignedTo && !issue.assignedTeam);
  const criticalIssues = issues.filter(issue => issue.priority === 'critical');
  const oldIssues = issues.filter(issue => {
    const daysSinceCreated = Math.floor((Date.now() - issue.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreated > 2 && issue.status !== 'resolved';
  });

  const issueStatusData = [
    { name: 'Active', value: issues.filter(i => i.status === 'active').length, color: '#ef4444' },
    { name: 'Pending', value: issues.filter(i => i.status === 'pending').length, color: '#eab308' },
    { name: 'Resolved', value: issues.filter(i => i.status === 'resolved').length, color: '#22c55e' },
  ];

  const departmentIssueData = [
    { department: 'Technical', active: 2, pending: 1, resolved: 1 },
    { department: 'Support', active: 0, pending: 0, resolved: 1 },
    { department: 'Field', active: 0, pending: 0, resolved: 0 },
  ];

  const sidebarItems = [
    { id: 'monitoring', label: 'Real-time Monitoring', icon: Monitor },
    { id: 'teams', label: 'Team Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'alerts', label: 'Critical Alerts', icon: AlertTriangle },
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
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );

  const handleCreateTeam = () => {
    if (teamName.trim() && selectedMembers.length > 0) {
      const newTeam = {
        id: String(teams.length + 1),
        name: teamName,
        description: `Team created by ${user?.name}`,
        members: selectedMembers,
        leaderId: selectedMembers[0],
        createdAt: new Date()
      };
      setTeams([...teams, newTeam]);
      setTeamName('');
      setSelectedMembers([]);
    }
  };

  const renderMonitoring = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issues.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unassignedIssues.length}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalIssues.length}</div>
            <p className="text-xs text-muted-foreground">
              High priority resolution needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{oldIssues.length}</div>
            <p className="text-xs text-muted-foreground">
              Issues older than 2 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Issues</CardTitle>
            <CardDescription>Issues requiring immediate assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unassignedIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{issue.title}</h4>
                    <p className="text-sm text-gray-600">Priority: {issue.priority}</p>
                  </div>
                  <Button size="sm">Assign</Button>
                </div>
              ))}
              {unassignedIssues.length === 0 && (
                <p className="text-gray-500 text-center py-4">No unassigned issues</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Teams</CardTitle>
            <CardDescription>Currently formed response teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teams.map((team) => (
                <div key={team.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{team.name}</h4>
                  <p className="text-sm text-gray-600">{team.description}</p>
                  <Badge variant="outline" className="mt-1">
                    {team.members.length} members
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTeams = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Form a team by selecting members from different departments
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Team Name</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Select Members</label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {persons.map((person) => (
                    <div key={person.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={person.id}
                        checked={selectedMembers.includes(person.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMembers([...selectedMembers, person.id]);
                          } else {
                            setSelectedMembers(selectedMembers.filter(id => id !== person.id));
                          }
                        }}
                      />
                      <label htmlFor={person.id} className="text-sm">
                        {person.name} - {person.departmentName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleCreateTeam} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{team.name}</h3>
                  <p className="text-gray-600">{team.description}</p>
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">Members:</h4>
                    <div className="flex flex-wrap gap-2">
                      {team.members.map((memberId) => {
                        const member = persons.find(p => p.id === memberId);
                        return member ? (
                          <Badge key={memberId} variant="outline">
                            {member.name} ({member.departmentName})
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Edit Team
                  </Button>
                  <Button variant="outline" size="sm">
                    Assign Issue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issues by Status</CardTitle>
            <CardDescription>Distribution of current issue statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={issueStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {issueStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues by Department</CardTitle>
            <CardDescription>Issue distribution across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentIssueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="active" fill="#ef4444" name="Active" />
                <Bar dataKey="pending" fill="#eab308" name="Pending" />
                <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Math.round((issues.filter(i => i.status === 'resolved').length / issues.length) * 100)}%
              </div>
              <p className="text-sm text-gray-600">Resolution Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round(issues.reduce((acc, issue) => {
                  if (issue.resolvedAt) {
                    const resolutionTime = issue.resolvedAt.getTime() - issue.createdAt.getTime();
                    return acc + resolutionTime / (1000 * 60 * 60 * 24);
                  }
                  return acc;
                }, 0) / issues.filter(i => i.resolvedAt).length) || 0}
              </div>
              <p className="text-sm text-gray-600">Avg Resolution Time (days)</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {teams.length}
              </div>
              <p className="text-sm text-gray-600">Active Teams</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Critical Alerts</h2>
      
      <div className="space-y-4">
        {criticalIssues.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Critical Issues Requiring Immediate Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {criticalIssues.map((issue) => (
                  <div key={issue.id} className="p-3 bg-white rounded-lg border">
                    <h4 className="font-medium">{issue.title}</h4>
                    <p className="text-sm text-gray-600">{issue.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-red-600">Critical</Badge>
                      <span className="text-xs text-gray-500">
                        Created: {issue.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {oldIssues.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Overdue Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {oldIssues.map((issue) => (
                  <div key={issue.id} className="p-3 bg-white rounded-lg border">
                    <h4 className="font-medium">{issue.title}</h4>
                    <p className="text-sm text-gray-600">
                      Created {Math.floor((Date.now() - issue.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days ago
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {issue.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {criticalIssues.length === 0 && oldIssues.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium text-green-800 mb-2">All Clear!</h3>
              <p className="text-gray-600">No critical alerts at this time.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'monitoring':
        return renderMonitoring();
      case 'teams':
        return renderTeams();
      case 'analytics':
        return renderAnalytics();
      case 'alerts':
        return renderAlerts();
      default:
        return renderMonitoring();
    }
  };

  return (
    <DashboardLayout
      title={`${user?.role?.toUpperCase()} Dashboard`}
      sidebar={Sidebar}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
