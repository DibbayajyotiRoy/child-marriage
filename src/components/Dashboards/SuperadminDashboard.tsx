import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, Shield, Briefcase, Plus, Edit, Trash2 } from 'lucide-react';

// Import your API services and types
import { departmentService } from '@/api/services/department.service';
import { personService } from '@/api/services/person.service';
import { caseService } from '@/api/services/case.service';
import { Department, Person, Case } from '@/types';

export function SuperadminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // State to hold data from the API
  const [departments, setDepartments] = useState<Department[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [deptData, personData, caseData] = await Promise.all([
          departmentService.getAll(),
          personService.getAll(),
          caseService.getAll(),
        ]);
        setDepartments(deptData);
        setPersons(personData);
        setCases(caseData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please make sure the API server is running.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Memoize derived data
  const police = useMemo(() => persons.filter(p => p.role === 'police'), [persons]);
  const departmentMembers = useMemo(() => persons.filter(p => p.role === 'person'), [persons]);
  const departmentMap = useMemo(() => new Map(departments.map(dept => [dept.id, dept.name])), [departments]);

  // --- CRUD Handlers ---

  const handleAddDepartment = async () => {
    const name = prompt("Enter new department name:");
    const district = prompt("Enter the district:");
    if (name && district) {
      try {
        const newDept = await departmentService.create({ name, district });
        setDepartments(prev => [...prev, newDept]);
      } catch (err) {
        alert("Failed to add department.");
        console.error(err);
      }
    }
  };

  const handleAddPerson = async (role: 'person' | 'police') => {
    const name = prompt(`Enter new ${role}'s name:`);
    const email = prompt("Enter email:");
    const password = prompt("Enter a temporary password:");
    const departmentIdStr = prompt(`Enter Department ID:\n${departments.map(d => `${d.id}: ${d.name}`).join('\n')}`);
    
    if(name && email && password && departmentIdStr) {
        const departmentId = parseInt(departmentIdStr, 10);
        if (isNaN(departmentId) || !departmentMap.has(departmentId)) {
            alert("Invalid Department ID.");
            return;
        }

        try {
            const newUser = await personService.create({ name, email, password, departmentId, role });
            setPersons(prev => [...prev, newUser]);
        } catch(err) {
            alert(`Failed to add ${role}.`);
            console.error(err);
        }
    }
  };

  const handleDeletePerson = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this person?")) {
      try {
        await personService.deletePerson(id);
        setPersons(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        alert("Failed to delete person.");
        console.error(err);
      }
    }
  };

  // --- UI and Render ---

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'departments', label: 'Departments', icon: Briefcase },
    { id: 'persons', label: 'Department Members', icon: Users },
    { id: 'police', label: 'Police', icon: Shield },
  ];

  // RESTORED: The JSX for the sidebar component
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="text-2xl font-bold">{departmentMembers.length}</div>
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
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Active Cases</span>
              <Badge variant="destructive">{cases.filter(c => c.status === 'active').length}</Badge>
            </div>
            {/* ... other case statuses ... */}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDepartments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Departments</h2>
        <Button onClick={handleAddDepartment} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Department
        </Button>
      </div>
      <div className="grid gap-4">
        {departments.map((dept) => (
          <Card key={dept.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{dept.name}</h3>
                  <p className="text-gray-600">District: {dept.district}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled> <Edit className="h-4 w-4" /> </Button>
                  {/* The Delete button has been removed from here */}
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
        <Button onClick={() => handleAddPerson('person')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Member
        </Button>
      </div>
      <div className="grid gap-4">
        {departmentMembers.map((person) => (
          <Card key={person.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{person.name}</h3>
                  <p className="text-gray-600">{person.email}</p>
                  <Badge variant="outline" className="mt-2">
                    {departmentMap.get(person.departmentId) || 'Unknown Department'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="outline" size="sm" disabled> <Edit className="h-4 w-4" /> </Button>
                   <Button variant="outline" size="sm" onClick={() => handleDeletePerson(person.id)}>
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
        <Button onClick={() => handleAddPerson('police')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Officer
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
                   <Badge variant="outline" className="mt-2">
                    Department: {departmentMap.get(officer.departmentId) || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="outline" size="sm" disabled> <Edit className="h-4 w-4" /> </Button>
                   <Button variant="outline" size="sm" onClick={() => handleDeletePerson(officer.id)}>
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
    if (isLoading) return <p>Loading system data...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'departments': return renderDepartments();
      case 'persons': return renderPersons();
      case 'police': return renderPolice();
      default: return renderOverview();
    }
  };

  return (
    <DashboardLayout title="Superadmin Dashboard" sidebar={Sidebar}>
      {renderContent()}
    </DashboardLayout>
  );
}