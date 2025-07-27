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
  FileText,
  Send,
  MapPin,
  Shield,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "../ui/sonner";

// --- API Service Imports ---
import {
  personService,
  type CreatePersonRequest,
} from "@/api/services/person.service";
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

const INITIAL_PERSON_FORM_STATE: Omit<
  CreatePersonRequest,
  "role" | "departmentId"
> = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  address: "",
  gender: "Male",
  phoneNumber: "",
};

export function SpDashboard() {
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

  const [personSearchTerm, setPersonSearchTerm] = useState("");
  const [issueSearchTerm, setIssueSearchTerm] = useState("");
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

  const policeDept = useMemo(
    () =>
      departments.find((dept) => dept.name.toLowerCase().includes("police")),
    [departments]
  );

  const filteredPersons = useMemo(() => {
    if (!policeDept) return [];
    return persons.filter(
      (p) =>
        p.departmentId === policeDept.id &&
        (locationFilter === "all" || p.address === locationFilter) &&
        `${p.firstName} ${p.lastName}`
          .toLowerCase()
          .includes(personSearchTerm.toLowerCase())
    );
  }, [persons, personSearchTerm, locationFilter, policeDept]);

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
    e.preventDefault();
    if (!policeDept) {
      toast.error("Error", {
        description: "Police department not found. Cannot add personnel.",
      });
      return;
    }
    if (!personForm.email || !personForm.password || !personForm.address) {
      toast.error("Validation Error", {
        description: "Please fill all required fields.",
      });
      return;
    }
    try {
      await personService.create({
        ...personForm,
        role: "MEMBER",
        departmentId: policeDept.id,
      });
      await fetchData(true);
      setIsPersonModalOpen(false);
      setPersonForm(INITIAL_PERSON_FORM_STATE);
      toast.success("Success", {
        description: "New personnel added successfully.",
      });
    } catch (err) {
      console.error("Failed to add person:", err);
      toast.error("Error", { description: "Failed to add new personnel." });
    }
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
    if (!selectedCase) return;
    try {
      const reports = await reportService.getByCaseId(selectedCase.id);
      setCaseReports(reports);
      setReportFeedbacks({});
      setIsReportsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      toast.error("Error", {
        description: "Could not fetch reports for this case.",
      });
    }
  };

  const handleFeedbackSubmit = async () => {
    const feedbackPromises = Object.entries(reportFeedbacks)
      .filter(([, feedbackText]) => feedbackText.trim() !== "")
      .map(([reportIdStr, sdmFeedback]) => {
        const reportId = parseInt(reportIdStr, 10);
        return reportService.update(reportId, { sdmFeedback });
      });

    if (feedbackPromises.length === 0) {
      toast.info("No Feedback", {
        description: "Please write some feedback before submitting.",
      });
      return;
    }

    try {
      await Promise.all(feedbackPromises);
      toast.success("Success", {
        description: "All feedback has been submitted successfully.",
      });
      setIsReportsModalOpen(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Submission Failed", {
        description: "An error occurred while submitting feedback.",
      });
    }
  };

  const Sidebar = (
    <nav className="p-4 bg-gray-50 h-full dark:bg-gray-900">
      <div className="space-y-2">
        <Button
          variant={activeTab === "personnel" ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => setActiveTab("personnel")}
        >
          <Shield className="h-5 w-5" /> Police Personnel
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
          <CardTitle>Police Personnel</CardTitle>
          <CardDescription>
            View and manage all personnel in the Police Department.
          </CardDescription>
        </div>
        <Button onClick={() => setIsPersonModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> Add Personnel
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input
            placeholder="Search by name..."
            value={personSearchTerm}
            onChange={(e) => setPersonSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full md:w-[250px]">
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
              No police personnel found matching the current filters.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderIssues = () => (
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
    <DashboardLayout title="SP Dashboard" sidebar={Sidebar}>
      <div className="p-6">{renderContent()}</div>

      {/* Add Person Modal */}
      <Dialog open={isPersonModalOpen} onOpenChange={setIsPersonModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Police Personnel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPerson} className="space-y-4 py-4">
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
              <Label htmlFor="person-address">Address (Subdivision)</Label>
              <Select
                required
                value={personForm.address}
                onValueChange={(value) =>
                  setPersonForm((p) => ({ ...p, address: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subdivision..." />
                </SelectTrigger>
                <SelectContent>
                  {TRIPURA_SUBDIVISIONS.map((subdivision) => (
                    <SelectItem key={subdivision} value={subdivision}>
                      {subdivision}
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
              <Button type="submit">Add Person</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Person Details Modal */}
      <Dialog
        open={isPersonDetailModalOpen}
        onOpenChange={setIsPersonDetailModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personnel Details</DialogTitle>
          </DialogHeader>
          {selectedPerson && (
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {selectedPerson.firstName}{" "}
                {selectedPerson.lastName}
              </p>
              <p>
                <strong>Email:</strong> {selectedPerson.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedPerson.phoneNumber}
              </p>
              <p>
                <strong>Gender:</strong> {selectedPerson.gender}
              </p>
              <p>
                <strong>Address:</strong> {selectedPerson.address}
              </p>
              <p>
                <strong>Department:</strong> {policeDept?.name || "N/A"}
              </p>
              <p>
                <strong>Role:</strong> <Badge>{selectedPerson.role}</Badge>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Issue Details Drawer */}
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
            {selectedCase && (
              <>
                <p>
                  <strong>Complainant:</strong> {selectedCase.complainantName}
                </p>
                <p>
                  <strong>Status:</strong> <Badge>{selectedCase.status}</Badge>
                </p>
                <p>
                  <strong>Description:</strong> {selectedCase.description}
                </p>
                {selectedCase.caseDetails?.[0] && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-bold">Girl's Details</h4>
                    <p>
                      {selectedCase.caseDetails[0].girlName} (Age:{" "}
                      {selectedCase.caseDetails[0].girlAge})
                    </p>
                    <p>
                      Address: {selectedCase.caseDetails[0].girlAddress},{" "}
                      {selectedCase.caseDetails[0].girlSubdivision}
                    </p>
                  </div>
                )}
              </>
            )}
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

      {/* Reports Modal */}
      <Dialog open={isReportsModalOpen} onOpenChange={setIsReportsModalOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Team Reports for Case #{selectedCase?.id.substring(0, 8)}
            </DialogTitle>
            <DialogDescription>
              Review reports and provide feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4 space-y-4">
            {caseReports.length > 0 ? (
              caseReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Report from: {personMap.get(report.personId)?.firstName}{" "}
                      {personMap.get(report.personId)?.lastName}
                    </CardTitle>
                    <CardDescription>
                      Submitted on:{" "}
                      {new Date(report.submittedAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="border p-2 rounded bg-gray-50 mb-2">
                      {report.content}
                    </p>
                    <Label
                      htmlFor={`feedback-${report.id}`}
                      className="font-semibold"
                    >
                      Provide Feedback:
                    </Label>
                    <Textarea
                      id={`feedback-${report.id}`}
                      placeholder={`Your feedback on ${
                        personMap.get(report.personId)?.firstName
                      }'s report...`}
                      value={reportFeedbacks[report.id] || ""}
                      onChange={(e) =>
                        setReportFeedbacks((prev) => ({
                          ...prev,
                          [report.id]: e.target.value,
                        }))
                      }
                    />
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">
                No reports have been submitted for this case yet.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReportsModalOpen(false)}
            >
              Close
            </Button>
            <Button onClick={handleFeedbackSubmit}>Submit All Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
