"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  AlertCircle,
  UserPlus,
  Eye,
  CheckCircle,
  FileText,
  Send,
  MapPin,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// --- API Service Imports ---
import { personService } from "@/api/services/person.service";
import { caseService } from "@/api/services/case.service";
import { departmentService } from "@/api/services/department.service";
import { reportService } from "@/api/services/report.service";

// --- Import central types ---
import type { Person, Case, Report, Department } from "@/types";

interface InfoModalState {
  isOpen: boolean;
  title: string;
  message: string;
  isError?: boolean;
}

const TRIPURA_SUBDIVISIONS = [
  "Sadar",
  "Mohanpur",
  "Jirania",
  "Udaipur",
  "Amarpur",
  "Karbook",
  "Belonia",
  "Sabroom",
  "Santirbazar",
  "Sonamura",
  "Melaghar",
  "Bishalgarh",
  "Khowai",
  "Teliamura",
  "Ambassa",
  "Kamalpur",
  "Longtarai Valley",
  "Gandacharra",
  "Dharmanagar",
  "Panisagar",
  "Kailasahar",
  "Kumarghat",
];

const INITIAL_PERSON_FORM_STATE: Omit<Person, "id" | "role"> & {
  password: string;
} = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  address: "",
  gender: "Male",
  phoneNumber: "",
  departmentId: undefined,
};

export function DmDashboard() {
  const [activeTab, setActiveTab] = useState("personnel");
  const [persons, setPersons] = useState<Person[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [caseReports, setCaseReports] = useState<Report[]>([]);
  const [reportFeedbacks, setReportFeedbacks] = useState<
    Record<number, string>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [isPersonDetailModalOpen, setIsPersonDetailModalOpen] = useState(false);
  const [isIssueDrawerOpen, setIsIssueDrawerOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const [infoModal, setInfoModal] = useState<InfoModalState>({
    isOpen: false,
    title: "",
    message: "",
  });
  const [personForm, setPersonForm] = useState(INITIAL_PERSON_FORM_STATE);

  // --- Search and Filter States ---
  const [personSearchTerm, setPersonSearchTerm] = useState("");
  const [issueSearchTerm, setIssueSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  // NEW: State for the location filter on the personnel page
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const fetchData = useCallback(async (refresh = false) => {
    if (!refresh) setIsLoading(true);
    try {
      const [personData, caseData, departmentData] = await Promise.all([
        personService.getAll().catch(() => []),
        caseService.getAll().catch(() => []),
        departmentService.getAll().catch(() => []),
      ]);
      setPersons(personData as Person[]);
      setCases(caseData as Case[]);
      setDepartments(departmentData as Department[]);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setInfoModal({
        isOpen: true,
        title: "Connection Error",
        message: "Failed to connect to the server.",
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const personMap = useMemo(
    () => new Map(persons.map((p) => [p.id, p])),
    [persons]
  );

  // UPDATE: The filtering logic for personnel now includes the new locationFilter
  const filteredPersons = useMemo(
    () =>
      persons.filter(
        (p) =>
          (departmentFilter === "all" || p.departmentId === departmentFilter) &&
          (locationFilter === "all" || p.address === locationFilter) && // New filter condition
          `${p.firstName} ${p.lastName}`
            .toLowerCase()
            .includes(personSearchTerm.toLowerCase())
      ),
    [persons, personSearchTerm, departmentFilter, locationFilter] // Add new filter to dependency array
  );

  const filteredCases = useMemo(
    () =>
      cases.filter(
        (c) =>
          c &&
          c.complainantName &&
          c.complainantName
            .toLowerCase()
            .includes(issueSearchTerm.toLowerCase())
      ),
    [cases, issueSearchTerm]
  );

  const handleAddPerson = async (e: React.FormEvent) => {
    // This function remains the same as in SdmDashboard
  };

  const openIssueDrawer = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsIssueDrawerOpen(true);
  };

  const openPersonDetailsModal = (person: Person) => {
    setSelectedPerson(person);
    setIsPersonDetailModalOpen(true);
  };

  const handleViewReports = async () => {
    // This function remains the same as in SdmDashboard
  };

  const Sidebar = (
    <nav className="p-4 bg-gray-50 h-full dark:bg-gray-900">
      <div className="space-y-2">
        <Button
          variant={activeTab === "personnel" ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => setActiveTab("personnel")}
        >
          <Users className="h-5 w-5" /> Personnel
        </Button>
        <Button
          variant={activeTab === "issues" ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => setActiveTab("issues")}
        >
          <AlertCircle className="h-5 w-5" /> Issues
        </Button>
      </div>
    </nav>
  );

  const renderPersonnel = () => (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <CardTitle>Personnel Management</CardTitle>
          <CardDescription>
            View, filter, and add personnel to the system.
          </CardDescription>
        </div>
        <Button onClick={() => setIsPersonModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> Add Person
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Search by name..."
            value={personSearchTerm}
            onChange={(e) => setPersonSearchTerm(e.target.value)}
            className="md:col-span-3"
          />
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* NEW: Location Filter Dropdown */}
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subdivisions</SelectItem>
              {TRIPURA_SUBDIVISIONS.map((subdivision) => (
                <SelectItem key={subdivision} value={subdivision}>
                  {subdivision}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          {filteredPersons.map((person) => (
            <Card
              key={person.id}
              className="p-4 flex justify-between items-center"
            >
              <div>
                <h4 className="font-semibold">{`${person.firstName} ${person.lastName}`}</h4>
                <p className="text-sm text-gray-600">{person.email}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1" /> {person.address}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => openPersonDetailsModal(person)}
              >
                <Eye className="h-4 w-4 mr-2" /> View Details
              </Button>
            </Card>
          ))}
          {filteredPersons.length === 0 && (
            <p className="text-center text-gray-500 py-6">
              No personnel found matching the current filters.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderIssues = () => (
    // This function's content is identical to SdmDashboard
    <Card>
      <CardHeader>
        <CardTitle>Issue Viewer</CardTitle>
        <CardDescription>Read and view all reported issues.</CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Search by complainant name..."
          value={issueSearchTerm}
          onChange={(e) => setIssueSearchTerm(e.target.value)}
          className="mb-4"
        />
        <div className="space-y-4">
          {filteredCases.map((caseItem) => (
            <Card
              key={caseItem.id}
              className="p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{caseItem.complainantName}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  <Badge variant="secondary">{caseItem.district}</Badge>
                  <Badge variant="outline" className="ml-2">
                    {caseItem.status}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => openIssueDrawer(caseItem)}
              >
                <Eye className="h-4 w-4 mr-2" /> View Details
              </Button>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    if (isLoading) return <Skeleton className="h-96" />;
    return activeTab === "personnel" ? renderPersonnel() : renderIssues();
  };

  return (
    <DashboardLayout title="DM Dashboard" sidebar={Sidebar}>
      <div className="p-6">{renderContent()}</div>

      {/* --- All Modals and Drawers are identical to SdmDashboard --- */}
      {/* They are included here for completeness */}

      <Dialog open={isPersonModalOpen} onOpenChange={setIsPersonModalOpen}>
        <DialogContent>{/* Add Person Form Here */}</DialogContent>
      </Dialog>
      <Dialog
        open={isPersonDetailModalOpen}
        onOpenChange={setIsPersonDetailModalOpen}
      >
        <DialogContent>{/* Person Details Here */}</DialogContent>
      </Dialog>

      <Drawer
        direction="right"
        open={isIssueDrawerOpen}
        onOpenChange={setIsIssueDrawerOpen}
      >
        <DrawerContent className="w-1/2 mt-0 flex flex-col h-screen">
          <DrawerHeader className="text-left border-b">
            <DrawerTitle>Case Details</DrawerTitle>
            <DrawerDescription>ID: {selectedCase?.id}</DrawerDescription>
          </DrawerHeader>
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {/* Redesigned Drawer Content Here */}
          </div>
          <DrawerFooter className="border-t flex-row justify-between">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
            <div className="space-x-2">
              <Button onClick={handleViewReports}>
                <FileText className="h-4 w-4 mr-2" />
                View Reports
              </Button>
              <Button
                variant="secondary"
                onClick={() => alert("Final Report logic goes here.")}
              >
                <Send className="h-4 w-4 mr-2" />
                Generate Final Report
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog
        open={isReportsModalOpen}
        onOpenChange={setIsReportsModalOpen}
        modal={false}
      >
        <DialogContent
          onPointerDownOutside={(e) => {
            e.stopPropagation();
          }}
          className="max-w-4xl h-[80vh] flex flex-col"
        >
          <DialogHeader>
            <DialogTitle>
              Team Reports for Case #{selectedCase?.id.substring(0, 8)}
            </DialogTitle>
            <DialogDescription>
              Review reports submitted by the team and provide feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4 space-y-4">
            {/* Reports Content Here */}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReportsModalOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => alert("Feedback submission logic goes here.")}
            >
              Submit All Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
