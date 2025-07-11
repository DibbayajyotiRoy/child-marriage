
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMockData } from '@/hooks/useMockData';
import { Settings, Users, UserCheck, Shield, Briefcase, Plus, Edit, Trash2 } from 'lucide-react';

export function SuperadminDashboard() {
  const { departments, persons, police, dice, issues } = useMockData();
  const [activeTab, setActiveTab] = useState('overview');

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'departments', label: 'Departments', icon: Briefcase },
    { id: 'persons', label: 'Department Members', icon: Users },
    { id: 'police', label: 'Police', icon: Shield },
    { id: 'dice', label: 'DICE', icon: UserCheck },
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

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personnel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{persons.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Police Officers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{police.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DICE Agents</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dice.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system metrics and health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Active Issues</span>
              <Badge variant="destructive">{issues.filter(i => i.status === 'active').length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Pending Issues</span>
              <Badge variant="secondary">{issues.filter(i => i.status === 'pending').length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Resolved Issues</span>
              <Badge variant="default">{issues.filter(i => i.status === 'resolved').length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDepartments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Departments</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="grid gap-4">
        {departments.map((dept) => (
          <Card key={dept.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{dept.name}</h3>
                  <p className="text-gray-600">{dept.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Created: {dept.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPersons = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Department Members</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="grid gap-4">
        {persons.map((person) => (
          <Card key={person.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{person.name}</h3>
                  <p className="text-gray-600">{person.email}</p>
                  <Badge variant="outline" className="mt-2">
                    {person.departmentName}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPolice = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Police Officers</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Officer
        </Button>
      </div>

      <div className="grid gap-4">
        {police.map((officer) => (
          <Card key={officer.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{officer.name}</h3>
                  <p className="text-gray-600">{officer.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">Badge: {officer.badgeNumber}</Badge>
                    <Badge variant="outline">{officer.station}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDice = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">DICE Agents</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Agent
        </Button>
      </div>

      <div className="grid gap-4">
        {dice.map((agent) => (
          <Card key={agent.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  <p className="text-gray-600">{agent.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">Agent: {agent.agentId}</Badge>
                    <Badge variant="outline">{agent.clearanceLevel}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'departments':
        return renderDepartments();
      case 'persons':
        return renderPersons();
      case 'police':
        return renderPolice();
      case 'dice':
        return renderDice();
      default:
        return renderOverview();
    }
  };

  return (
    <DashboardLayout
      title="Superadmin Dashboard"
      sidebar={Sidebar}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
