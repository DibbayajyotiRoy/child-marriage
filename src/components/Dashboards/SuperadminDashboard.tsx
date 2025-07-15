"use client";

import type React from "react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  Settings,
  Users,
  Shield,
  Briefcase,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Eye,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Activity,
  Edit,
  Building,
  ChevronLeft,
  Download,
  Filter,
  RefreshCw,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// --- API Service Imports ---
import { departmentService } from "@/api/services/department.service";
import { personService } from "@/api/services/person.service";
import { caseService } from "@/api/services/case.service";
import { reportService } from "@/api/services/report.service";
import { teamFormationService } from "@/api/services/team-formation.service";

// --- Type Definitions ---
// Import all types except for Report, which we will define locally with the correct fields.
import type { Department, Person, Case, TeamFormation } from "@/types";

// Use a more detailed local definition for Report to match the UI's requirements.
export interface Report {
  id: number;
  caseId: number;
  submittedBy: number;
  teamFormationId: number;
  content: string;
  reportType: "initial" | "progress" | "final" | "incident";
  attachments?: string[];
  tags?: string[];
  priority: "low" | "medium" | "high" | "urgent";
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Enhanced type definitions for this component
interface CaseDetails extends Case {
  reports: Report[];
  teamFormations: (TeamFormation & { membersInfo: Person[] })[];
  activityLog: ActivityLogEntry[];
}

interface ActivityLogEntry {
  id: number;
  timestamp: string;
  activity: string;
  actor?: string;
}

interface InfoModalState {
  isOpen: boolean;
  title: string;
  message: string;
  isError?: boolean;
}

interface ConfirmationModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface EditPersonState {
  isOpen: boolean;
  person: Person | null;
}

// --- Constants ---
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

const INITIAL_PERSON_FORM_STATE = {
  name: "",
  email: "",
  password: "",
  departmentId: "",
};
const INITIAL_DEPARTMENT_FORM_STATE = { name: "", district: "" };
const INITIAL_CASE_FORM_STATE = {
  title: "",
  description: "",
  departmentId: "",
  createdBy: 1, // Assuming admin user ID is 1
};

export function SuperadminDashboard() {
  // --- Component State Management ---
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    null
  );

  // Data stores from API
  const [departments, setDepartments] = useState<Department[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [teamFormations, setTeamFormations] = useState<TeamFormation[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Advanced filtering states
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Real-time update states
  const [autoRefresh, setAutoRefresh] = useState(false);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Modal visibility states
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isCreateCaseModalOpen, setIsCreateCaseModalOpen] = useState(false);
  const [editPersonState, setEditPersonState] = useState<EditPersonState>({
    isOpen: false,
    person: null,
  });
  const [selectedCaseDetails, setSelectedCaseDetails] =
    useState<CaseDetails | null>(null);

  // Generic modal states
  const [infoModal, setInfoModal] = useState<InfoModalState>({
    isOpen: false,
    title: "",
    message: "",
  });
  const [confirmationModal, setConfirmationModal] =
    useState<ConfirmationModalState>({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: () => {},
    });

  // UI interaction states
  const [expandedUi, setExpandedUi] = useState({
    departments: new Set<number>(),
    issues: true,
  });
  const [personModalType, setPersonModalType] = useState<"person" | "police">(
    "person"
  );

  // Form input states
  const [departmentForm, setDepartmentForm] = useState(
    INITIAL_DEPARTMENT_FORM_STATE
  );
  const [personForm, setPersonForm] = useState(INITIAL_PERSON_FORM_STATE);
  const [caseForm, setCaseForm] = useState(INITIAL_CASE_FORM_STATE);
  const [editPersonForm, setEditPersonForm] = useState({
    name: "",
    email: "",
    role: "person",
  });

  // Filtering and searching states
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [issueSearchTerm, setIssueSearchTerm] = useState("");
  const [memberSearchTerm, setMemberSearchTerm] = useState("");

  // --- Data Fetching and Initialization ---
  const fetchData = useCallback(
    async (page = 0, size = pageSize, refresh = false) => {
      try {
        if (!refresh) setIsLoading(true);

        // Fetch paginated data
        const [deptResult, personResult, caseResult] = await Promise.all([
          departmentService
            .getDepartmentsPaginated(page, size, `${sortBy},${sortDirection}`)
            .catch(() => ({
              content: [] as Department[],
              totalElements: 0,
              totalPages: 0,
              size: size,
              number: page,
            })),
          personService.getPersonsPaginated(page, size).catch(() => ({
            content: [] as Person[],
            totalElements: 0,
            totalPages: 0,
            size: size,
            number: page,
          })),
          caseService.getAll().catch(() => [] as Case[]),
        ]);

        // Fetch additional data
        const [reportData, teamData] = await Promise.all([
          reportService.getAll().catch(() => []),
          teamFormationService.getAll().catch(() => []),
        ]);

        setDepartments(deptResult.content);
        setPersons(personResult.content);
        setCases(caseResult);
        // Cast reportData to the local, detailed Report type
        setReports(reportData as Report[]);
        setTeamFormations(teamData);

        // Update pagination info
        setTotalPages(deptResult.totalPages);
        setTotalElements(deptResult.totalElements);
        setCurrentPage(page);

        // Update activity log
        if (!refresh) {
          setActivityLog([
            {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              activity: "Dashboard data loaded successfully.",
            },
            {
              id: Date.now() + 1,
              timestamp: new Date().toISOString(),
              activity: `Found ${deptResult.totalElements} departments, ${personResult.totalElements} personnel.`,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setInfoModal({
          isOpen: true,
          title: "Connection Error",
          message:
            "Failed to connect to the server. Please check your connection and try again.",
          isError: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize, sortBy, sortDirection]
  );

  // --- useEffect hooks moved inside the component body ---
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
      refreshInterval.current = null;
    }
  }, []);

  const startAutoRefresh = useCallback(() => {
    if (refreshInterval.current) clearInterval(refreshInterval.current);
    refreshInterval.current = setInterval(() => {
      fetchData(currentPage, pageSize, true);
    }, 30000); // Refresh every 30 seconds
  }, [currentPage, pageSize, fetchData]);

  useEffect(() => {
    if (autoRefresh) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
    return () => stopAutoRefresh();
  }, [autoRefresh, startAutoRefresh, stopAutoRefresh]);

  // --- Memoized Data Derivations ---
  const departmentMap = useMemo(
    () => new Map(departments.map((dept) => [dept.id, dept])),
    [departments]
  );
  const personMap = useMemo(
    () => new Map(persons.map((p) => [p.id, p])),
    [persons]
  );

  const caseStats = useMemo(() => {
    return cases.reduce(
      (acc, c) => {
        acc.total++;
        if (c.status === "active") acc.active++;
        else if (c.status === "resolved") acc.resolved++;
        else if (c.status === "pending") acc.pending++;
        return acc;
      },
      { total: 0, active: 0, resolved: 0, pending: 0 }
    );
  }, [cases]);

  // --- UI Toggling Functions ---
  const toggleDepartment = useCallback((deptId: number) => {
    setExpandedUi((prev) => {
      const newExpanded = new Set(prev.departments);
      newExpanded.has(deptId)
        ? newExpanded.delete(deptId)
        : newExpanded.add(deptId);
      return { ...prev, departments: newExpanded };
    });
  }, []);

  const toggleIssues = useCallback(() => {
    setExpandedUi((prev) => ({ ...prev, issues: !prev.issues }));
  }, []);

  // --- CRUD & Action Handler Functions ---
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentForm.name || !departmentForm.district) return;

    try {
      const newDept = await departmentService.create({
        name: departmentForm.name,
        district: departmentForm.district,
      });
      setDepartments((prev) => [...prev, newDept]);
      setDepartmentForm(INITIAL_DEPARTMENT_FORM_STATE);
      setIsDepartmentModalOpen(false);
      setInfoModal({
        isOpen: true,
        title: "Success",
        message: "New department added successfully.",
      });
    } catch (err) {
      console.error("Failed to add department:", err);
      setInfoModal({
        isOpen: true,
        title: "Error",
        message: "Failed to add department. Please try again.",
        isError: true,
      });
    }
  };

  const handleDeleteDepartment = async (departmentId: number) => {
    try {
      await departmentService.deleteDepartment(departmentId);
      setDepartments((prev) => prev.filter((d) => d.id !== departmentId));
      if (selectedDepartment === departmentId) {
        setActiveTab("overview");
        setSelectedDepartment(null);
      }
      setInfoModal({
        isOpen: true,
        title: "Success",
        message: "Department deleted successfully.",
      });
    } catch (err) {
      console.error("Failed to delete department:", err);
      setInfoModal({
        isOpen: true,
        title: "Error",
        message:
          "Failed to delete department. It may have associated personnel.",
        isError: true,
      });
    }
  };

  const confirmDeleteDepartment = (departmentId: number) => {
    const hasPersonnel = persons.some((p) => p.departmentId === departmentId);
    if (hasPersonnel) {
      setInfoModal({
        isOpen: true,
        title: "Cannot Delete",
        message:
          "Cannot delete department with active personnel. Please reassign or remove personnel first.",
        isError: true,
      });
      return;
    }

    setConfirmationModal({
      isOpen: true,
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete this department? This action cannot be undone.",
      onConfirm: () => handleDeleteDepartment(departmentId),
    });
  };

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !personForm.name ||
      !personForm.email ||
      !personForm.password ||
      !personForm.departmentId
    )
      return;

    const departmentIdAsNumber = Number(personForm.departmentId);
    if (
      isNaN(departmentIdAsNumber) ||
      !departmentMap.has(departmentIdAsNumber)
    ) {
      setInfoModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please select a valid department.",
        isError: true,
      });
      return;
    }

    try {
      const newUser = await personService.create({
        name: personForm.name,
        email: personForm.email,
        password: personForm.password,
        departmentId: departmentIdAsNumber,
        role: personModalType,
      });
      setPersons((prev) => [...prev, newUser]);
      setPersonForm(INITIAL_PERSON_FORM_STATE);
      setIsPersonModalOpen(false);
      setInfoModal({
        isOpen: true,
        title: "Success",
        message: `New ${personModalType} added successfully.`,
      });
    } catch (err) {
      console.error("Failed to add person:", err);
      setInfoModal({
        isOpen: true,
        title: "Error",
        message: `Failed to add ${personModalType}. Please check the details and try again.`,
        isError: true,
      });
    }
  };

  const handleEditPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPersonState.person) return;

    try {
      const updatedPerson = await personService.update(
        editPersonState.person.id,
        {
          name: editPersonForm.name,
          email: editPersonForm.email,
          role: editPersonForm.role as "person" | "police",
        }
      );
      setPersons(
        persons.map((p) => (p.id === updatedPerson.id ? updatedPerson : p))
      );
      setEditPersonState({ isOpen: false, person: null });
      setInfoModal({
        isOpen: true,
        title: "Success",
        message: "Personnel details updated successfully.",
      });
    } catch (err) {
      console.error("Failed to update person:", err);
      setInfoModal({
        isOpen: true,
        title: "Error",
        message: "Failed to update personnel details.",
        isError: true,
      });
    }
  };

  const handleDeletePerson = async (personId: number) => {
    try {
      await personService.deletePerson(personId);
      setPersons((prev) => prev.filter((p) => p.id !== personId));
      setInfoModal({
        isOpen: true,
        title: "Success",
        message: "Personnel deleted successfully.",
      });
    } catch (err) {
      console.error("Failed to delete person:", err);
      setInfoModal({
        isOpen: true,
        title: "Error",
        message: "Failed to delete personnel.",
        isError: true,
      });
    }
  };

  const confirmDeletePerson = (personId: number) => {
    setConfirmationModal({
      isOpen: true,
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete this person? This action cannot be undone.",
      onConfirm: () => handleDeletePerson(personId),
    });
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseForm.title || !caseForm.description || !caseForm.departmentId)
      return;

    try {
      const newCase = await caseService.create({
        title: caseForm.title,
        description: caseForm.description,
        departmentId: Number(caseForm.departmentId),
        createdBy: caseForm.createdBy,
        status: "pending",
      });
      setCases((prev) => [...prev, newCase]);
      setIsCreateCaseModalOpen(false);
      setCaseForm(INITIAL_CASE_FORM_STATE);
      setInfoModal({
        isOpen: true,
        title: "Success",
        message: "New case created successfully.",
      });
    } catch (err) {
      console.error("Failed to create case:", err);
      setInfoModal({
        isOpen: true,
        title: "Error",
        message: "Failed to create new case.",
        isError: true,
      });
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchData(newPage, pageSize);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    fetchData(0, newSize);
  };

  // Export functionality
  const handleExportData = async (
    type: "departments" | "personnel" | "cases"
  ) => {
    try {
      let data: any[] = [];
      let filename = "";

      switch (type) {
        case "departments":
          data = departments;
          filename = "departments.csv";
          break;
        case "personnel":
          data = persons;
          filename = "personnel.csv";
          break;
        case "cases":
          data = cases;
          filename = "cases.csv";
          break;
      }

      const csvContent = convertToCSV(data);
      downloadCSV(csvContent, filename);

      setInfoModal({
        isOpen: true,
        title: "Export Successful",
        message: `${type} data exported successfully.`,
      });
    } catch (err) {
      setInfoModal({
        isOpen: true,
        title: "Export Failed",
        message: "Failed to export data. Please try again.",
        isError: true,
      });
    }
  };

  // CSV conversion utility
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]).join(",");
    const rows = data
      .map((item) =>
        Object.values(item)
          .map((value) =>
            typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
          )
          .join(",")
      )
      .join("\n");

    return `${headers}\n${rows}`;
  };

  // Download CSV utility
  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Advanced search functionality
  const handleAdvancedSearch = async (searchParams: {
    query?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    department?: string;
  }) => {
    try {
      setIsLoading(true);

      // This would typically call a search endpoint on your backend
      let filteredCases = cases;

      if (searchParams.query) {
        filteredCases = filteredCases.filter(
          (c) =>
            c.title.toLowerCase().includes(searchParams.query!.toLowerCase()) ||
            c.description
              .toLowerCase()
              .includes(searchParams.query!.toLowerCase())
        );
      }

      if (searchParams.status && searchParams.status !== "all") {
        filteredCases = filteredCases.filter(
          (c) => c.status === searchParams.status
        );
      }

      if (searchParams.dateFrom) {
        filteredCases = filteredCases.filter(
          (c) => new Date(c.createdAt) >= new Date(searchParams.dateFrom!)
        );
      }

      if (searchParams.dateTo) {
        filteredCases = filteredCases.filter(
          (c) => new Date(c.createdAt) <= new Date(searchParams.dateTo!)
        );
      }

      setCases(filteredCases);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Modal Opening Functions ---
  const openPersonModal = (type: "person" | "police", deptId?: number) => {
    setPersonModalType(type);
    setPersonForm({
      ...INITIAL_PERSON_FORM_STATE,
      departmentId: deptId ? String(deptId) : "",
    });
    setIsPersonModalOpen(true);
  };

  const openEditPersonModal = (person: Person) => {
    setEditPersonState({ isOpen: true, person: person });
    setEditPersonForm({
      name: person.name,
      email: person.email,
      role: person.role,
    });
  };

  const openIssueDetailsModal = async (caseItem: Case) => {
    try {
      // Fetch related data for the case
      const [caseReportsData, caseTeams] = await Promise.all([
        reportService.getByCaseId(caseItem.id).catch(() => []),
        teamFormationService.getByCaseId(caseItem.id).catch(() => []),
      ]);

      // Cast the report data to our local, detailed Report type
      const caseReports = caseReportsData as Report[];

      const mockActivity: ActivityLogEntry[] = [
        { id: 1, timestamp: caseItem.createdAt, activity: "Case created." },
        {
          id: 2,
          timestamp: new Date().toISOString(),
          activity: "Case details viewed.",
        },
      ];

      const teamsWithMembers = caseTeams.map((team) => ({
        ...team,
        membersInfo: team.members
          .map((member) => personMap.get(member.personId))
          .filter((p): p is Person => p !== undefined),
      }));

      setSelectedCaseDetails({
        ...caseItem,
        reports: caseReports,
        teamFormations: teamsWithMembers,
        activityLog: mockActivity,
      });
      setIsIssueModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch case details:", err);
      setInfoModal({
        isOpen: true,
        title: "Error",
        message: "Failed to load case details.",
        isError: true,
      });
    }
  };

  // --- Render Functions ---
  const renderLoadingSkeletons = () => (
    <div className="p-6 space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );

  const Sidebar = (
    <nav className="p-4 bg-gray-50 h-full dark:bg-gray-900">
      <div className="space-y-2">
        <Button
          variant={activeTab === "overview" ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => setActiveTab("overview")}
        >
          <Settings className="h-5 w-5" /> Overview
        </Button>

        <div className="pt-4">
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={toggleIssues}
          >
            <div className="flex items-center gap-3 font-semibold">
              <AlertCircle className="h-5 w-5" /> Issues
            </div>
            {expandedUi.issues ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          {expandedUi.issues && (
            <div className="ml-6 mt-1 space-y-1">
              {["active", "pending", "resolved"].map((status) => (
                <Button
                  key={status}
                  variant={
                    activeTab === `issues-${status}` ? "secondary" : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTab(`issues-${status}`)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4">
          <div className="flex items-center justify-between mb-2 px-3">
            <h3 className="text-sm font-semibold text-gray-700">Departments</h3>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => setIsDepartmentModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            {departments.map((dept) => (
              <div key={dept.id}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => toggleDepartment(dept.id)}
                >
                  {expandedUi.departments.has(dept.id) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <Building className="h-4 w-4" />
                  <span className="truncate">{dept.name}</span>
                </Button>
                {expandedUi.departments.has(dept.id) && (
                  <div className="ml-8 space-y-1 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs gap-2"
                      onClick={() => {
                        setSelectedDepartment(dept.id);
                        setActiveTab("department-details");
                      }}
                    >
                      <Eye className="h-3 w-3" /> View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs gap-2"
                      onClick={() => openPersonModal("police", dept.id)}
                    >
                      <Shield className="h-3 w-3" /> Add Police
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs text-red-600 hover:text-red-600 gap-2"
                      onClick={() => confirmDeleteDepartment(dept.id)}
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Departments
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Personnel
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{persons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{caseStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved Cases
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{caseStats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Case Status Breakdown</CardTitle>
            <CardDescription>
              Visual summary of all cases by status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(caseStats)
                .filter(([key]) => key !== "total")
                .map(([status, count]) => (
                  <div key={status} className="flex items-center">
                    <span className="w-24 capitalize">{status}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 mx-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{
                          width: `${
                            caseStats.total > 0
                              ? (count / caseStats.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right font-bold">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>System activity log.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityLog.map((log) => (
              <div key={log.id} className="flex items-start gap-4">
                <Activity className="h-5 w-5 mt-1 text-gray-500" />
                <div>
                  <p className="text-sm">{log.activity}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDepartmentDetails = () => {
    const dept = departments.find((d) => d.id === selectedDepartment);
    if (!dept)
      return (
        <div>Department not found. Please select one from the sidebar.</div>
      );

    const deptMembers = persons.filter(
      (p) =>
        p.departmentId === selectedDepartment &&
        p.name.toLowerCase().includes(memberSearchTerm.toLowerCase())
    );
    const deptCases = cases.filter(
      (c) => c.departmentId === selectedDepartment
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Building /> {dept.name}
          </h2>
          <div className="flex gap-2">
            <Button onClick={() => openPersonModal("person", dept.id)}>
              <UserPlus className="h-4 w-4 mr-2" /> Add Personnel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeleteDepartment(dept.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete Department
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personnel</CardTitle>
            <CardDescription>
              Personnel assigned to {dept.name} ({dept.district}).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search personnel by name..."
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              {deptMembers.map((member) => (
                <Card
                  key={member.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <h4 className="font-semibold">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <Badge
                      variant={
                        member.role === "police" ? "default" : "secondary"
                      }
                      className="mt-1 capitalize"
                    >
                      {member.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditPersonModal(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => confirmDeletePerson(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {deptMembers.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No personnel found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Cases</CardTitle>
          </CardHeader>
          <CardContent>
            {deptCases.length > 0 ? (
              deptCases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className="mb-2 p-4 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold">{caseItem.title}</h4>
                    <p className="text-sm text-gray-500">
                      Status:{" "}
                      <Badge
                        variant={
                          caseItem.status === "active"
                            ? "destructive"
                            : caseItem.status === "resolved"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {caseItem.status}
                      </Badge>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => openIssueDetailsModal(caseItem)}
                  >
                    View Details
                  </Button>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                No cases assigned to this department.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderIssuesList = (status: "active" | "pending" | "resolved") => {
    const filteredCases = cases
      .filter((c) => c.status === status)
      .filter(
        (c) =>
          locationFilter === "all" ||
          departmentMap.get(c.departmentId)?.district === locationFilter
      )
      .filter((c) =>
        c.title.toLowerCase().includes(issueSearchTerm.toLowerCase())
      );

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-3xl font-bold capitalize">{status} Issues</h2>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              className="w-full md:w-48"
              placeholder="Search by title..."
              value={issueSearchTerm}
              onChange={(e) => setIssueSearchTerm(e.target.value)}
            />
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by location..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subdivisions</SelectItem>
                {TRIPURA_SUBDIVISIONS.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsCreateCaseModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Case
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredCases.length > 0 ? (
            filteredCases.map((caseItem) => (
              <Card key={caseItem.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{caseItem.title}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      <Badge variant="secondary">
                        {departmentMap.get(caseItem.departmentId)?.district ||
                          "N/A"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Created:{" "}
                      {new Date(caseItem.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => openIssueDetailsModal(caseItem)}
                  >
                    <Eye className="h-4 w-4 mr-2" /> View Details
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No {status} issues found for the selected filters.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  // --- Main Content Renderer ---
  const renderContent = () => {
    if (isLoading) return renderLoadingSkeletons();

    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "department-details":
        return renderDepartmentDetails();
      case "issues-active":
        return renderIssuesList("active");
      case "issues-pending":
        return renderIssuesList("pending");
      case "issues-resolved":
        return renderIssuesList("resolved");
      default:
        return renderOverview();
    }
  };

  // --- Main Component Return ---
  return (
    <DashboardLayout title="Superadmin Dashboard" sidebar={Sidebar}>
      <div className="p-6">{renderContent()}</div>

      {/* --- MODALS --- */}

      {/* Generic Info Modal */}
      <Dialog
        open={infoModal.isOpen}
        onOpenChange={() => setInfoModal((p) => ({ ...p, isOpen: false }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {infoModal.isError ? (
                <AlertCircle className="text-red-500" />
              ) : (
                <CheckCircle className="text-green-500" />
              )}
              {infoModal.title}
            </DialogTitle>
            <DialogDescription>{infoModal.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setInfoModal((p) => ({ ...p, isOpen: false }))}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generic Confirmation Modal */}
      <Dialog
        open={confirmationModal.isOpen}
        onOpenChange={() =>
          setConfirmationModal((p) => ({ ...p, isOpen: false }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmationModal.title}</DialogTitle>
            <DialogDescription>{confirmationModal.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmationModal((p) => ({ ...p, isOpen: false }))
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                confirmationModal.onConfirm();
                setConfirmationModal((p) => ({ ...p, isOpen: false }));
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Department Modal */}
      <Dialog
        open={isDepartmentModalOpen}
        onOpenChange={setIsDepartmentModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDepartment} className="space-y-4 py-4">
            <div>
              <Label htmlFor="dept-name">Department Name</Label>
              <Input
                id="dept-name"
                value={departmentForm.name}
                onChange={(e) =>
                  setDepartmentForm((p) => ({ ...p, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="dept-district">District</Label>
              <Select
                required
                value={departmentForm.district}
                onValueChange={(value) =>
                  setDepartmentForm((p) => ({ ...p, district: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {TRIPURA_SUBDIVISIONS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDepartmentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Department</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Person Modal */}
      <Dialog open={isPersonModalOpen} onOpenChange={setIsPersonModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add New{" "}
              {personModalType === "police" ? "Police Officer" : "Personnel"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPerson} className="space-y-4 py-4">
            <div>
              <Label htmlFor="person-name">Name</Label>
              <Input
                id="person-name"
                value={personForm.name}
                onChange={(e) =>
                  setPersonForm((p) => ({ ...p, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="person-email">Email</Label>
              <Input
                id="person-email"
                type="email"
                value={personForm.email}
                onChange={(e) =>
                  setPersonForm((p) => ({ ...p, email: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="person-password">Temporary Password</Label>
              <Input
                id="person-password"
                type="password"
                value={personForm.password}
                onChange={(e) =>
                  setPersonForm((p) => ({ ...p, password: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="person-dept">Department</Label>
              <Select
                required
                value={personForm.departmentId}
                onValueChange={(value) =>
                  setPersonForm((p) => ({ ...p, departmentId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPersonModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add {personModalType === "police" ? "Officer" : "Personnel"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Person Modal */}
      <Dialog
        open={editPersonState.isOpen}
        onOpenChange={() => setEditPersonState({ isOpen: false, person: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Personnel: {editPersonState.person?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditPerson} className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-person-name">Name</Label>
              <Input
                id="edit-person-name"
                value={editPersonForm.name}
                onChange={(e) =>
                  setEditPersonForm((p) => ({ ...p, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-person-email">Email</Label>
              <Input
                id="edit-person-email"
                type="email"
                value={editPersonForm.email}
                onChange={(e) =>
                  setEditPersonForm((p) => ({ ...p, email: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-person-role">Role</Label>
              <Select
                required
                value={editPersonForm.role}
                onValueChange={(value) =>
                  setEditPersonForm((p) => ({ ...p, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="person">Personnel</SelectItem>
                  <SelectItem value="police">Police Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setEditPersonState({ isOpen: false, person: null })
                }
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Case Modal */}
      <Dialog
        open={isCreateCaseModalOpen}
        onOpenChange={setIsCreateCaseModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCase} className="space-y-4 py-4">
            <div>
              <Label htmlFor="case-title">Case Title</Label>
              <Input
                id="case-title"
                value={caseForm.title}
                onChange={(e) =>
                  setCaseForm((p) => ({ ...p, title: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="case-desc">Description</Label>
              <Input
                id="case-desc"
                value={caseForm.description}
                onChange={(e) =>
                  setCaseForm((p) => ({ ...p, description: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="case-dept">Assign to Department</Label>
              <Select
                required
                value={caseForm.departmentId}
                onValueChange={(value) =>
                  setCaseForm((p) => ({ ...p, departmentId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateCaseModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Case</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Issue Details Modal */}
      <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedCaseDetails?.title}</DialogTitle>
            <DialogDescription>
              Case ID: {selectedCaseDetails?.id} | Status:
              <Badge
                variant={
                  selectedCaseDetails?.status === "active"
                    ? "destructive"
                    : selectedCaseDetails?.status === "resolved"
                    ? "default"
                    : "secondary"
                }
                className="ml-2"
              >
                {selectedCaseDetails?.status}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Case Description</h3>
              <p className="text-gray-700">
                {selectedCaseDetails?.description}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Investigating Team</h3>
              {(selectedCaseDetails?.teamFormations.length ?? 0) > 0 ? (
                selectedCaseDetails?.teamFormations.map((team) => (
                  <div
                    key={team.id}
                    className="p-3 border rounded-md mb-2 bg-gray-50"
                  >
                    <h4 className="font-medium">
                      Team (Formed:{" "}
                      {new Date(team.createdAt).toLocaleDateString()})
                    </h4>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {team.membersInfo.map((member) => (
                        <li key={member.id}>
                          {member.name} ({member.role}) - Status:
                          <Badge variant="outline" className="ml-1">
                            {
                              team.members.find((m) => m.personId === member.id)
                                ?.status
                            }
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No team assigned to this case yet.
                </p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Reports</h3>
              {(selectedCaseDetails?.reports.length ?? 0) > 0 ? (
                selectedCaseDetails?.reports.map((report) => (
                  <Card key={report.id} className="bg-gray-50 mb-2">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Report by:{" "}
                        {personMap.get(report.submittedBy)?.name || "Unknown"}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">{report.reportType}</Badge>
                        <Badge variant="outline">{report.priority}</Badge>
                        <Badge variant="outline">{report.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p>{report.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Submitted:{" "}
                        {new Date(report.submittedAt).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-gray-500">
                  No reports submitted for this case yet.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
