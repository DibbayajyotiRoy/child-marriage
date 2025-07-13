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
  AlertCircle,
  Zap,
  Settings
} from 'lucide-react';

export function OthersDashboard() {
  const { user } = useAuth();
  const { issues, teams, persons, police, dice, setTeams } = useMockData();
  const [activeTab, setActiveTab] = useState('monitoring');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [teamName, setTeamName] = useState('');
  const [selectedCase, setSelectedCase] = useState<string>('');

  const unassignedIssues = issues.filter(issue => !issue.assignedTo && !issue.assignedTeam);
  const criticalIssues = issues.filter(issue => issue.priority === 'critical');
  const urgentCases = issues.filter(issue => issue.urgencyLevel === 'immediate' && issue.status !== 'resolved');
  const rescueNeeded = issues.filter(issue => issue.rescueOperationNeeded && issue.status !== 'resolved');

  // Combine all available personnel for team formation
  const allPersonnel = [
    ...persons.map(p => ({ ...p, type: 'Social Worker' })),
    ...police.map(p => ({ ...p, type: 'Police Officer' })),
    ...dice.map(p => ({ ...p, type: 'DICE Agent' }))
  ];

  const issueStatusData = [
    { name: 'Active', value: issues.filter(i => i.status === 'active').length, color: '#ef4444' },
    { name: 'Pending', value: issues.filter(i => i.status === 'pending').length, color: '#eab308' },
    { name: 'Resolved', value: issues.filter(i => i.status === 'resolved').length, color: '#22c55e' },
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

  const handleCreateManualTeam = () => {
    if (teamName.trim() && selectedMembers.length > 0) {
      const newTeam = {
        id: String(teams.length + 1),
        name: teamName,
        description: `Manually created team by ${user?.name}`,
        members: selectedMembers,
        leaderId: selectedMembers[0],
        createdAt: new Date()
      };
      setTeams([...teams, newTeam]);
      setTeamName('');
      setSelectedMembers([]);
    }
  };

  const handleCreateAutomaticTeam = () => {
    if (selectedCase) {
      const caseData = issues.find(issue => issue.id === selectedCase);
      if (caseData) {
        // Automatic team formation logic based on case requirements
        let autoSelectedMembers: string[] = [];
        
        // Always include a social worker
        const socialWorker = persons.find(p => p.departmentId === '1'); // Social Services
        if (socialWorker) autoSelectedMembers.push(socialWorker.id);
        
        // Add police if law enforcement needed or rescue operation required
        if (caseData.lawEnforcementNotified || caseData.rescueOperationNeeded) {
          const policeOfficer = police.find(p => p.station === 'Women Protection Unit');
          if (policeOfficer) autoSelectedMembers.push(policeOfficer.id);
        }
        
        // Add legal aid if court order required
        if (caseData.courtOrderRequired) {
          const legalAid = persons.find(p => p.departmentId === '2'); // Legal Aid
          if (legalAid) autoSelectedMembers.push(legalAid.id);
        }
        
        // Add DICE agent for high-priority cases
        if (caseData.priority === 'critical' || caseData.urgencyLevel === 'immediate') {
          const diceAgent = dice.find(d => d.clearanceLevel === 'Level 3');
          if (diceAgent) autoSelectedMembers.push(diceAgent.id);
        }

        const newTeam = {
          id: String(teams.length + 1),
          name: `Auto Team - Case ${caseData.id}`,
          description: `Automatically formed team for: ${caseData.title}`,
          members: autoSelectedMembers,
          leaderId: autoSelectedMembers[0],
          createdAt: new Date()
        };
        
        setTeams([...teams, newTeam]);
        setSelectedCase('');
        console.log('Automatic team created for case:', caseData.title);
      }
    }
  };

  const renderMonitoring = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issues.length}</div>
            <p className="text-xs text-muted-foreground">
              Child marriage prevention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalIssues.length}</div>
            <p className="text-xs text-muted-foreground">
              Immediate intervention needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rescue Operations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rescueNeeded.length}</div>
            <p className="text-xs text-muted-foreground">
              Active rescue operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{teams.length}</div>
            <p className="text-xs text-muted-foreground">
              Deployed response teams
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Urgent Cases Requiring Attention</CardTitle>
            <CardDescription>Cases needing immediate intervention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentCases.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">{issue.title}</h4>
                    <p className="text-xs text-gray-600">Victim Age: {issue.victimAge} | Location: {issue.location}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="destructive" className="text-xs">{issue.priority}</Badge>
                      {issue.rescueOperationNeeded && (
                        <Badge className="bg-orange-500 text-xs">Rescue Needed</Badge>
                      )}
                    </div>
                  </div>
                  <Button size="sm">Assign Team</Button>
                </div>
              ))}
              {urgentCases.length === 0 && (
                <p className="text-gray-500 text-center py-4">No urgent cases at this time</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Teams</CardTitle>
            <CardDescription>Currently deployed teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teams.map((team) => (
                <div key={team.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{team.name}</h4>
                  <p className="text-sm text-gray-600">{team.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {team.members.length} members
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                  </div>
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
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Zap className="h-4 w-4" />
                Auto Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Automatic Team Formation</DialogTitle>
                <DialogDescription>
                  AI will automatically select the best team members based on case requirements
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Case for Team Formation</label>
                  <Select value={selectedCase} onValueChange={setSelectedCase}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Choose a case" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedIssues.map((issue) => (
                        <SelectItem key={issue.id} value={issue.id}>
                          Case {issue.id}: {issue.title.substring(0, 50)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCase && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Auto-Selection Criteria:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Social Worker (always included)</li>
                      <li>• Police Officer (if rescue/law enforcement needed)</li>
                      <li>• Legal Aid (if court order required)</li>
                      <li>• DICE Agent (for critical/immediate cases)</li>
                    </ul>
                  </div>
                )}

                <Button onClick={handleCreateAutomaticTeam} className="w-full" disabled={!selectedCase}>
                  <Zap className="h-4 w-4 mr-2" />
                  Create Automatic Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Manual Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manual Team Creation</DialogTitle>
                <DialogDescription>
                  Manually select team members from available personnel
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
                  <label className="text-sm font-medium">Select Personnel</label>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {allPersonnel.map((person) => (
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
                        <label htmlFor={person.id} className="text-sm flex-1">
                          {person.name} - {person.type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleCreateManualTeam} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Manual Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
                        const member = allPersonnel.find(p => p.id === memberId);
                        return member ? (
                          <Badge key={memberId} variant="outline">
                            {member.name} ({member.type})
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
            <CardTitle>Cases by Status</CardTitle>
            <CardDescription>Distribution of current case statuses</CardDescription>
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
            <CardTitle>Cases by Urgency</CardTitle>
            <CardDescription>Case distribution across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={issueStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
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
                {teams.length}
              </div>
              <p className="text-sm text-gray-600">Active Teams</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {criticalIssues.length}
              </div>
              <p className="text-sm text-gray-600">Critical Cases</p>
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
                Critical Cases Requiring Immediate Attention
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

        {urgentCases.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Urgent Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {urgentCases.map((issue) => (
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

        {criticalIssues.length === 0 && urgentCases.length === 0 && (
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
      title={`${user?.role?.toUpperCase()} Dashboard - Child Marriage Prevention`}
      sidebar={Sidebar}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
