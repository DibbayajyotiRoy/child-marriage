"use client";

import type React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
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
  Search,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

// --- API Service Imports ---
import {
  departmentService,
  type CreateDepartmentRequest,
} from "@/api/services/department.service";
import { personService } from "@/api/services/person.service";
import { caseService } from "@/api/services/case.service";
import { reportService } from "@/api/services/report.service";
import { teamFormationService } from "@/api/services/team-formation.service";
import { postService } from "@/api/services/post.service";

// --- Type Definitions ---
import type {
  Department,
  Person as BasePerson,
  Case as BaseCase,
  TeamFormation,
  Report,
  Post,
} from "@/types";

// Enriched local types to match expected data structure
interface Person extends BasePerson {
  departmentId?: string;
  role: "MEMBER" | "SUPERVISOR" | "SUPERADMIN";
}

interface EnrichedCase extends BaseCase {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  complainantName: string;
  district: string;
  status: string;
  reportedAt: string;
}

interface CaseDetails extends EnrichedCase {
  reports: Report[];
  teamFormation: TeamFormation | null;
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
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  departmentId: "",
  address: "",
  gender: "Male",
  phoneNumber: "",
};
const INITIAL_DEPARTMENT_FORM_STATE: CreateDepartmentRequest = {
  name: "",
  district: "",
};
const INITIAL_CASE_FORM_STATE = {
  title: "",
  description: "",
  departmentId: "",
  createdBy: "00000000-0000-0000-0000-000000000000",
};
const INITIAL_POST_FORM_STATE = {
  postName: "",
  departmentId: "",
  rank: 0,
};

// --- Helper Function ---
const getDeptCategory = (
  deptName: string
): "POLICE" | "DICE" | "ADMINISTRATION" | null => {
  const name = deptName.toLowerCase();
  if (name.includes("police")) return "POLICE";
  if (name.includes("dise")) return "DICE";
  if (name.includes("admin")) return "ADMINISTRATION";
  return null;
};

export function SuperadminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [departments, setDepartments] = useState<Department[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [cases, setCases] = useState<EnrichedCase[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isCreateCaseModalOpen, setIsCreateCaseModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editPersonState, setEditPersonState] = useState<EditPersonState>({
    isOpen: false,
    person: null,
  });
  const [selectedCaseDetails, setSelectedCaseDetails] =
    useState<CaseDetails | null>(null);
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
  const [expandedUi, setExpandedUi] = useState({
    departments: new Set<string>(),
    issues: true,
  });
  const [personModalType, setPersonModalType] = useState<"person" | "police">(
    "person"
  );
  const [departmentForm, setDepartmentForm] = useState(
    INITIAL_DEPARTMENT_FORM_STATE
  );
  const [personForm, setPersonForm] = useState(INITIAL_PERSON_FORM_STATE);
  const [caseForm, setCaseForm] = useState(INITIAL_CASE_FORM_STATE);
  const [postForm, setPostForm] = useState(INITIAL_POST_FORM_STATE);
  const [editPersonForm, setEditPersonForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "MEMBER" as "MEMBER" | "SUPERVISOR" | "SUPERADMIN",
  });
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [issueSearchTerm, setIssueSearchTerm] = useState("");
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [caseIdSearch, setCaseIdSearch] = useState("");
  const [searchedCase, setSearchedCase] = useState<EnrichedCase | null>(null);

  const fetchData = useCallback(async (refresh = false) => {
    try {
      if (!refresh) setIsLoading(true);
      const [deptResult, personResult, caseResult, postResult] =
        await Promise.all([
          departmentService.getAll().catch(() => []),
          personService.getAll().catch(() => []),
          caseService.getAll().catch(() => []),
          postService.getAll().catch(() => []),
        ]);
      setDepartments(deptResult);
      setPersons(personResult as Person[]);
      setCases(caseResult as EnrichedCase[]);
      setPosts(postResult);
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
            activity: `Found ${deptResult.length} departments, ${personResult.length} personnel, and ${postResult.length} posts.`,
          },
        ]);
      }
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

  const departmentMap = useMemo(
    () => new Map(departments.map((dept) => [dept.id, dept])),
    [departments]
  );
  const personMap = useMemo(
    () => new Map(persons.map((p) => [p.id, p])),
    [persons]
  );
  const caseStats = useMemo(
    () =>
      cases.reduce(
        (acc, c) => {
          acc.total++;
          if (
            c.status.toLowerCase().includes("investigating") ||
            c.status.toLowerCase().includes("reported")
          )
            acc.active++;
          else if (c.status.toLowerCase().includes("closed")) acc.resolved++;
          else acc.pending++;
          return acc;
        },
        { total: 0, active: 0, resolved: 0, pending: 0 }
      ),
    [cases]
  );
  const postStats = useMemo(
    () =>
      posts.reduce((acc, post) => {
        acc[post.department] = (acc[post.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    [posts]
  );
  const toggleDepartment = useCallback((deptId: string) => {
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

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentForm.name || !departmentForm.district) return;
    try {
      await departmentService.create(departmentForm);
      await fetchData(true);
      setIsDepartmentModalOpen(false);
      setDepartmentForm(INITIAL_DEPARTMENT_FORM_STATE);
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
        message: "Failed to add department.",
        isError: true,
      });
    }
  };
  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.postName || !postForm.departmentId || postForm.rank <= 0) {
      setInfoModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please fill all fields and provide a valid rank.",
        isError: true,
      });
      return;
    }

    const selectedDept = departments.find(
      (d) => d.id === postForm.departmentId
    );

    if (!selectedDept) {
      setInfoModal({
        isOpen: true,
        title: "Error",
        message: "The selected department could not be found.",
        isError: true,
      });
      return;
    }

    const departmentCategory = getDeptCategory(selectedDept.name);

    if (!departmentCategory) {
      setInfoModal({
        isOpen: true,
        title: "Unrecognized Department Type",
        message: `Could not determine the category for "${selectedDept.name}". Please ensure the department name contains 'Police', 'DISE', or 'Admin' to assign it a post category.`,
        isError: true,
      });
      return;
    }

    try {
      await postService.create({
        postName: postForm.postName,
        department: departmentCategory,
        rank: postForm.rank,
      });
      await fetchData(true);
      setIsPostModalOpen(false);
      setPostForm(INITIAL_POST_FORM_STATE);
      setInfoModal({
        isOpen: true,
        title: "Success",
        message: "New post created successfully.",
      });
    } catch (err) {
      console.error("Failed to add post:", err);
      setInfoModal({
        isOpen: true,
        title: "Error",
        message: "Failed to create new post.",
        isError: true,
      });
    }
  };
  const handleDeleteDepartment = async (departmentId: string) => {
    try {
      await departmentService.deleteDepartment(departmentId);
      await fetchData(true);
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
        message: "Failed to delete department.",
        isError: true,
      });
    }
  };
  const confirmDeleteDepartment = (departmentId: string) => {
    setConfirmationModal({
      isOpen: true,
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this department?",
      onConfirm: () => handleDeleteDepartment(departmentId),
    });
  };

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !personForm.firstName ||
      !personForm.lastName ||
      !personForm.email ||
      !personForm.password ||
      !personForm.departmentId ||
      !personForm.address ||
      !personForm.gender ||
      !personForm.phoneNumber
    ) {
      setInfoModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please fill out all required fields.",
        isError: true,
      });
      return;
    }
    const roleForBackend =
      personModalType === "police" ? "SUPERVISOR" : "MEMBER";
    try {
      await personService.create({
        firstName: personForm.firstName,
        lastName: personForm.lastName,
        email: personForm.email,
        password: personForm.password,
        departmentId: personForm.departmentId,
        role: roleForBackend,
        address: personForm.address,
        gender: personForm.gender,
        phoneNumber: personForm.phoneNumber,
      });
      await fetchData(true);
      setIsPersonModalOpen(false);
      setPersonForm(INITIAL_PERSON_FORM_STATE);
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
        message: `Failed to add ${personModalType}. Check console for details.`,
        isError: true,
      });
    }
  };

  const handleEditPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPersonState.person) return;
    try {
      await personService.update(editPersonState.person.id, {
        firstName: editPersonForm.firstName,
        lastName: editPersonForm.lastName,
        email: editPersonForm.email,
        role: editPersonForm.role,
      });
      await fetchData(true);
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
  const handleDeletePerson = async (personId: string) => {
    try {
      await personService.deletePerson(personId);
      await fetchData(true);
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
  const confirmDeletePerson = (personId: string) => {
    setConfirmationModal({
      isOpen: true,
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this person?",
      onConfirm: () => handleDeletePerson(personId),
    });
  };
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseForm.title || !caseForm.description || !caseForm.departmentId)
      return;
    try {
      await caseService.create({
        title: caseForm.title,
        description: caseForm.description,
        departmentId: caseForm.departmentId,
        createdBy: caseForm.createdBy,
        status: "pending",
      });
      await fetchData(true);
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
  const openPersonModal = (type: "person" | "police", deptId?: string) => {
    setPersonModalType(type);
    setPersonForm({ ...INITIAL_PERSON_FORM_STATE, departmentId: deptId || "" });
    setIsPersonModalOpen(true);
  };
  const openPostModal = (department?: Department) => {
    setPostForm({
      ...INITIAL_POST_FORM_STATE,
      departmentId: department ? department.id : "",
    });
    setIsPostModalOpen(true);
  };
  const openEditPersonModal = (person: Person) => {
    setEditPersonState({ isOpen: true, person: person });
    setEditPersonForm({
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      role: person.role || "MEMBER",
    });
  };
  const openIssueDetailsModal = async (caseItem: EnrichedCase) => {
    try {
      const [caseReportsData, caseTeam] = await Promise.all([
        reportService.getByCaseId(caseItem.id).catch(() => []),
        teamFormationService.getByCaseId(caseItem.id).catch(() => null),
      ]);
      setSelectedCaseDetails({
        ...caseItem,
        reports: caseReportsData,
        teamFormation: caseTeam,
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
  const handleCaseSearch = async () => {
    if (!caseIdSearch.trim()) return;
    setIsLoading(true);
    try {
      const foundCase = (await caseService.getById(
        caseIdSearch.trim()
      )) as EnrichedCase;
      setSearchedCase(foundCase);
    } catch (error) {
      setSearchedCase(null);
      setInfoModal({
        isOpen: true,
        title: "Not Found",
        message: `Case with ID "${caseIdSearch}" was not found.`,
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const clearCaseSearch = () => {
    setCaseIdSearch("");
    setSearchedCase(null);
  };

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
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Departments
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases.length}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Posts by Department Type</CardTitle>
            <CardDescription>Breakdown of all official posts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(postStats).map(([dept, count]) => (
                <div key={dept} className="flex items-center">
                  <span className="w-32 capitalize">{dept.toLowerCase()}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 mx-4">
                    <div
                      className="bg-green-600 h-4 rounded-full"
                      style={{
                        width: `${
                          posts.length > 0 ? (count / posts.length) * 100 : 0
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
    if (!dept) return <div>Department not found.</div>;

    const departmentCategory = getDeptCategory(dept.name);
    const deptMembers = persons.filter(
      (p) =>
        p.departmentId === dept.id &&
        `${p.firstName} ${p.lastName}`
          .toLowerCase()
          .includes(memberSearchTerm.toLowerCase())
    );
    const deptCases = cases.filter(
      (c) => c.departmentId === selectedDepartment
    );
    const deptPosts = departmentCategory
      ? posts.filter((p) => p.department === departmentCategory)
      : [];
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
            <Button onClick={() => openPostModal(dept)}>
              <Plus className="h-4 w-4 mr-2" /> Add Post
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Department Posts</CardTitle>
            <CardDescription>
              Generic posts available to this department type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deptPosts.length > 0 ? (
                deptPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex justify-between items-center p-2 border rounded"
                  >
                    <span className="font-medium">{post.postName}</span>
                    <Badge>Rank: {post.rank}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No posts found for this department type. Add one from the main
                  "Posts" menu.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Personnel</CardTitle>
            <CardDescription>
              Personnel assigned to {dept.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search personnel..."
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
                    <h4 className="font-semibold">{`${member.firstName} ${member.lastName}`}</h4>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <Badge
                      variant={
                        member.role === "SUPERVISOR" ? "default" : "secondary"
                      }
                      className="mt-1 capitalize"
                    >
                      {member.role?.toLowerCase()}
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
                  No personnel found for this department.
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
                No cases assigned.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  const renderIssuesList = (
    statusString: "active" | "pending" | "resolved"
  ) => {
    const casesToDisplay = (searchedCase ? [searchedCase] : cases).filter(
      (c) => {
        if (!c) return false;
        const caseStatus = c.status.toLowerCase();
        let matchesStatus = false;
        if (statusString === "active") {
          matchesStatus =
            caseStatus.includes("investigating") ||
            caseStatus.includes("reported");
        } else if (statusString === "resolved") {
          matchesStatus = caseStatus.includes("closed");
        } else if (statusString === "pending") {
          matchesStatus = !["investigating", "reported", "closed"].some((s) =>
            caseStatus.includes(s)
          );
        }

        if (searchedCase) {
          return matchesStatus;
        }

        return (
          matchesStatus &&
          (locationFilter === "all" ||
            (c.district && c.district === locationFilter)) &&
          c.complainantName &&
          c.complainantName
            .toLowerCase()
            .includes(issueSearchTerm.toLowerCase())
        );
      }
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-3xl font-bold capitalize">
            {statusString} Issues
          </h2>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              className="w-full md:w-48"
              placeholder="Search by Complainant..."
              value={issueSearchTerm}
              onChange={(e) => setIssueSearchTerm(e.target.value)}
            />
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by District..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {[...new Set(cases.map((c) => c.district))]
                  .filter(Boolean)
                  .map((dist) => (
                    <SelectItem key={dist} value={dist}>
                      {dist}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsCreateCaseModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Case
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Find Case by ID</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Input
              placeholder="Enter full Case ID (UUID)..."
              value={caseIdSearch}
              onChange={(e) => setCaseIdSearch(e.target.value)}
            />
            <Button onClick={handleCaseSearch}>
              <Search className="h-4 w-4 mr-2" /> Find
            </Button>
            {searchedCase && (
              <Button variant="outline" onClick={clearCaseSearch}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
        <div className="space-y-4">
          {casesToDisplay.length > 0 ? (
            casesToDisplay.map((caseItem) => (
              <Card key={caseItem.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      Complainant: {caseItem.complainantName}
                    </h3>
                    <div className="text-sm text-gray-600 mt-1">
                      <Badge variant="secondary">{caseItem.district}</Badge>
                      <Badge variant="outline" className="ml-2">
                        {caseItem.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Reported:{" "}
                      {new Date(caseItem.reportedAt).toLocaleDateString()}
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
                No {statusString} issues found for the selected filters.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };
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
                      <UserPlus className="h-3 w-3" /> Add Personnel
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs gap-2"
                      onClick={() => openPostModal(dept)}
                    >
                      <Briefcase className="h-3 w-3" /> Add Post
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
        <div className="pt-4">
          <div className="flex items-center justify-between mb-2 px-3">
            <h3 className="text-sm font-semibold text-gray-700">Posts</h3>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => openPostModal()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderContent = () => {
    if (isLoading) {
      return renderLoadingSkeletons();
    }
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

  return (
    <DashboardLayout title="Superadmin Dashboard" sidebar={Sidebar}>
      <div className="p-6">{renderContent()}</div>
      {/* --- MODALS --- */}
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
                placeholder="e.g. Sadar Police Station"
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
                  <SelectValue placeholder="Select a district" />
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
      <Dialog open={isPersonModalOpen} onOpenChange={setIsPersonModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add New{" "}
              {personModalType === "police" ? "Police Officer" : "Personnel"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPerson} className="space-y-4 py-4">
            {/* Person form fields remain unchanged */}
            <div>
              <Label htmlFor="person-fname">First Name</Label>
              <Input
                id="person-fname"
                value={personForm.firstName}
                onChange={(e) =>
                  setPersonForm((p) => ({ ...p, firstName: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="person-lname">Last Name</Label>
              <Input
                id="person-lname"
                value={personForm.lastName}
                onChange={(e) =>
                  setPersonForm((p) => ({ ...p, lastName: e.target.value }))
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
              <Label htmlFor="person-phone">Phone Number</Label>
              <Input
                id="person-phone"
                value={personForm.phoneNumber}
                onChange={(e) =>
                  setPersonForm((p) => ({ ...p, phoneNumber: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="person-gender">Gender</Label>
              <Select
                required
                value={personForm.gender}
                onValueChange={(value) =>
                  setPersonForm((p) => ({ ...p, gender: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="person-address">Address</Label>
              <Textarea
                id="person-address"
                value={personForm.address}
                onChange={(e) =>
                  setPersonForm((p) => ({ ...p, address: e.target.value }))
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
                    <SelectItem key={dept.id} value={dept.id}>
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
      <Dialog
        open={editPersonState.isOpen}
        onOpenChange={() => setEditPersonState({ isOpen: false, person: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Personnel:{" "}
              {`${editPersonState.person?.firstName} ${editPersonState.person?.lastName}`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditPerson} className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-person-fname">First Name</Label>
              <Input
                id="edit-person-fname"
                value={editPersonForm.firstName}
                onChange={(e) =>
                  setEditPersonForm((p) => ({
                    ...p,
                    firstName: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-person-lname">Last Name</Label>
              <Input
                id="edit-person-lname"
                value={editPersonForm.lastName}
                onChange={(e) =>
                  setEditPersonForm((p) => ({ ...p, lastName: e.target.value }))
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
                  setEditPersonForm((p) => ({
                    ...p,
                    role: value as "MEMBER" | "SUPERVISOR" | "SUPERADMIN",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Personnel</SelectItem>
                  <SelectItem value="SUPERVISOR">Police Officer</SelectItem>
                  <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
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
                    <SelectItem key={dept.id} value={dept.id}>
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
      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Post</DialogTitle>
            <DialogDescription>
              Select a department to associate this post with. The system will
              automatically assign the correct category.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPost} className="space-y-4 py-4">
            <div>
              <Label htmlFor="post-name">Post Name</Label>
              <Input
                id="post-name"
                value={postForm.postName}
                onChange={(e) =>
                  setPostForm((p) => ({ ...p, postName: e.target.value }))
                }
                placeholder="e.g. Constable, Inspector"
                required
              />
            </div>
            <div>
              <Label htmlFor="post-department">Department</Label>
              <Select
                required
                value={postForm.departmentId}
                onValueChange={(value) =>
                  setPostForm((p) => ({ ...p, departmentId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="post-rank">Rank</Label>
              <Input
                id="post-rank"
                type="number"
                value={postForm.rank}
                onChange={(e) =>
                  setPostForm((p) => ({
                    ...p,
                    rank: parseInt(e.target.value, 10) || 0,
                  }))
                }
                required
                placeholder="A numeric value for hierarchy"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPostModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Post</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedCaseDetails?.title}</DialogTitle>
            <DialogDescription>
              Case ID: {selectedCaseDetails?.id} | Status:{" "}
              <Badge
                variant={
                  selectedCaseDetails?.status === "INVESTIGATING"
                    ? "destructive"
                    : selectedCaseDetails?.status === "CLOSED"
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
              {selectedCaseDetails?.teamFormation ? (
                <div className="p-3 border rounded-md mb-2 bg-gray-50">
                  <h4 className="font-medium">
                    Team (Formed:{" "}
                    {selectedCaseDetails.teamFormation.formed_at
                      ? new Date(
                          selectedCaseDetails.teamFormation.formed_at
                        ).toLocaleDateString()
                      : "N/A"}
                    )
                  </h4>
                  <p className="text-sm text-gray-500 mt-2">
                    Member IDs:{" "}
                    {selectedCaseDetails.teamFormation.member_ids.join(", ")}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No team assigned.</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Reports</h3>
              {selectedCaseDetails?.reports.length ?? 0 > 0 ? (
                selectedCaseDetails?.reports.map((report) => (
                  <Card key={report.id} className="bg-gray-50 mb-2">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Report by:{" "}
                        {personMap.get(report.personId)?.firstName || "Unknown"}
                      </CardTitle>
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
                <p className="text-gray-500">No reports submitted.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
