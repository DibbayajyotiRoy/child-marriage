"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Settings,
  Users,
  Shield,
  Briefcase,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Eye,
  UserPlus,
} from "lucide-react"

// Import your API services and types
import { departmentService } from "@/api/services/department.service"
import { personService } from "@/api/services/person.service"
import { caseService } from "@/api/services/case.service"
import type { Department, Person, Case } from "@/types"

export function SuperadminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null)

  // State to hold data from the API
  const [departments, setDepartments] = useState<Department[]>([])
  const [persons, setPersons] = useState<Person[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false)
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false)
  const [personModalType, setPersonModalType] = useState<"person" | "police">("person")
  const [expandedDepartments, setExpandedDepartments] = useState<Set<number>>(new Set())

  // Form states
  const [departmentForm, setDepartmentForm] = useState({ name: "", district: "" })
  const [personForm, setPersonForm] = useState({ name: "", email: "", password: "", departmentId: "" })

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [deptData, personData, caseData] = await Promise.all([
          departmentService.getAll(),
          personService.getAll(),
          caseService.getAll(),
        ])
        setDepartments(deptData)
        setPersons(personData)
        setCases(caseData)
        setError(null)
      } catch (err) {
        setError("Failed to fetch data. Please make sure the API server is running.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Memoize derived data
  const police = useMemo(() => persons.filter((p) => p.role === "police"), [persons])
  const departmentMembers = useMemo(() => persons.filter((p) => p.role === "person"), [persons])
  const departmentMap = useMemo(() => new Map(departments.map((dept) => [dept.id, dept.name])), [departments])

  // Toggle department expansion
  const toggleDepartment = (deptId: number) => {
    const newExpanded = new Set(expandedDepartments)
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId)
    } else {
      newExpanded.add(deptId)
    }
    setExpandedDepartments(newExpanded)
  }

  // --- CRUD Handlers ---
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (departmentForm.name && departmentForm.district) {
      try {
        const newDept = await departmentService.create({
          name: departmentForm.name,
          district: departmentForm.district,
        })
        setDepartments((prev) => [...prev, newDept])
        setDepartmentForm({ name: "", district: "" })
        setIsDepartmentModalOpen(false)
      } catch (err) {
        alert("Failed to add department.")
        console.error(err)
      }
    }
  }

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (personForm.name && personForm.email && personForm.password && personForm.departmentId) {
      const departmentId = Number.parseInt(personForm.departmentId, 10)
      if (isNaN(departmentId) || !departmentMap.has(departmentId)) {
        alert("Invalid Department ID.")
        return
      }
      try {
        const newUser = await personService.create({
          name: personForm.name,
          email: personForm.email,
          password: personForm.password,
          departmentId,
          role: personModalType,
        })
        setPersons((prev) => [...prev, newUser])
        setPersonForm({ name: "", email: "", password: "", departmentId: "" })
        setIsPersonModalOpen(false)
      } catch (err) {
        alert(`Failed to add ${personModalType}.`)
        console.error(err)
      }
    }
  }

  const handleDeletePerson = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this person?")) {
      try {
        await personService.deletePerson(id)
        setPersons((prev) => prev.filter((p) => p.id !== id))
      } catch (err) {
        alert("Failed to delete person.")
        console.error(err)
      }
    }
  }

  const openPersonModal = (type: "person" | "police", deptId?: number) => {
    setPersonModalType(type)
    if (deptId) {
      setPersonForm((prev) => ({ ...prev, departmentId: deptId.toString() }))
    }
    setIsPersonModalOpen(true)
  }

  // --- UI Components ---
  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Settings },
    // { id: "persons", label: "Department Members", icon: Users },
    // { id: "police", label: "Police", icon: Shield },
  ]

  // Department Modal
  const DepartmentModal = (
    <Dialog open={isDepartmentModalOpen} onOpenChange={setIsDepartmentModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddDepartment} className="space-y-4">
          <div>
            <Label htmlFor="dept-name">Department Name</Label>
            <Input
              id="dept-name"
              value={departmentForm.name}
              onChange={(e) => setDepartmentForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter department name"
              required
            />
          </div>
          <div>
            <Label htmlFor="dept-district">District</Label>
            <Input
              id="dept-district"
              value={departmentForm.district}
              onChange={(e) => setDepartmentForm((prev) => ({ ...prev, district: e.target.value }))}
              placeholder="Enter district"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsDepartmentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Department</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )

  // Person Modal
  const PersonModal = (
    <Dialog open={isPersonModalOpen} onOpenChange={setIsPersonModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New {personModalType === "police" ? "Police Officer" : "Department Member"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddPerson} className="space-y-4">
          <div>
            <Label htmlFor="person-name">Name</Label>
            <Input
              id="person-name"
              value={personForm.name}
              onChange={(e) => setPersonForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter name"
              required
            />
          </div>
          <div>
            <Label htmlFor="person-email">Email</Label>
            <Input
              id="person-email"
              type="email"
              value={personForm.email}
              onChange={(e) => setPersonForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email"
              required
            />
          </div>
          <div>
            <Label htmlFor="person-password">Temporary Password</Label>
            <Input
              id="person-password"
              type="password"
              value={personForm.password}
              onChange={(e) => setPersonForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Enter temporary password"
              required
            />
          </div>
          <div>
            <Label htmlFor="person-dept">Department</Label>
            <Select
              value={personForm.departmentId}
              onValueChange={(value) => setPersonForm((prev) => ({ ...prev, departmentId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsPersonModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add {personModalType === "police" ? "Officer" : "Member"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )

  // Sidebar with departments
  const Sidebar = (
    <nav className="p-4">
      <div className="space-y-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === item.id ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}

        <div className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Departments</h3>
            <Dialog open={isDepartmentModalOpen} onOpenChange={setIsDepartmentModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-6 w-6 p-0 bg-transparent">
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          <div className="space-y-1">
            {departments.map((dept) => (
              <div key={dept.id}>
                <button
                  onClick={() => toggleDepartment(dept.id)}
                  className="w-full flex items-center gap-2 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  {expandedDepartments.has(dept.id) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <Briefcase className="h-3 w-3" />
                  <span className="truncate">{dept.name}</span>
                </button>

                {expandedDepartments.has(dept.id) && (
                  <div className="ml-6 space-y-1">
                    <button
                      onClick={() => {
                        setSelectedDepartment(dept.id)
                        setActiveTab("department-details")
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 rounded"
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </button>
                    <button
                      onClick={() => openPersonModal("person", dept.id)}
                      className="w-full flex items-center gap-2 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 rounded"
                    >
                      <UserPlus className="h-3 w-3" />
                      Add Post
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )

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
              <Badge variant="destructive">{cases.filter((c) => c.status === "active").length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDepartmentDetails = () => {
    const dept = departments.find((d) => d.id === selectedDepartment)
    if (!dept) return <div>Department not found</div>

    const deptMembers = persons.filter((p) => p.departmentId === selectedDepartment)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{dept.name} - Details</h2>
          <Button onClick={() => openPersonModal("person", dept.id)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Member
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Department Name</h3>
                <p className="text-gray-600">{dept.name}</p>
              </div>
              <div>
                <h3 className="font-semibold">District</h3>
                <p className="text-gray-600">{dept.district}</p>
              </div>
              <div>
                <h3 className="font-semibold">Total Members</h3>
                <p className="text-gray-600">{deptMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deptMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <Badge variant="outline" className="mt-1">
                      {member.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeletePerson(member.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderPersons = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Department Members</h2>
        <Button onClick={() => openPersonModal("person")} className="flex items-center gap-2">
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
                    {departmentMap.get(person.departmentId) || "Unknown Department"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Edit className="h-4 w-4" />
                  </Button>
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
  )

  const renderPolice = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Police Officers</h2>
        <Button onClick={() => openPersonModal("police")} className="flex items-center gap-2">
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
                    Department: {departmentMap.get(officer.departmentId) || "Unknown"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Edit className="h-4 w-4" />
                  </Button>
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
  )

  const renderContent = () => {
    if (isLoading) return <p>Loading system data...</p>
    if (error) return <p className="text-red-500">{error}</p>

    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "department-details":
        return renderDepartmentDetails()
      case "persons":
        return renderPersons()
      case "police":
        return renderPolice()
      default:
        return renderOverview()
    }
  }

  return (
    <DashboardLayout title="Superadmin Dashboard" sidebar={Sidebar}>
      {renderContent()}
      {DepartmentModal}
      {PersonModal}
    </DashboardLayout>
  )
}
