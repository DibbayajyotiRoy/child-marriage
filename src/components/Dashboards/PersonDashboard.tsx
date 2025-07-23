"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Eye,
  FileText,
  Send,
  User,
  Edit3,
  Save,
  X,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  ShieldQuestion,
  Star,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Case, TeamFormation, Person, Report, Department } from "@/types";
import { caseService } from "../../api/services/case.service";
import { reportService } from "../../api/services/report.service";
import { personService } from "../../api/services/person.service";
import { teamFormationService } from "../../api/services/team-formation.service";
import { departmentService } from "../../api/services/department.service";

// Assume the Report type might be extended with feedback from the backend
interface ReportWithFeedback extends Report {
  sdmFeedback?: string; // Optional feedback field
}

export function PersonDashboard() {
  const { user } = useAuth(); // The user object from AuthContext holds the profile data.

  const [activeTab, setActiveTab] = useState("active");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedCaseTeam, setSelectedCaseTeam] = useState<Person[]>([]);
  const [reportContent, setReportContent] = useState("");
  const [cases, setCases] = useState<Case[]>([]);
  const [reports, setReports] = useState<ReportWithFeedback[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isCaseDrawerOpen, setIsCaseDrawerOpen] = useState(false);

  // --- REWRITTEN: Data loading logic based on the correct types ---
  const loadDashboardData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Step 1: Fetch all necessary data in parallel.
      const [allCases, userReports, allDepartments] = await Promise.all([
        caseService.getAll(),
        reportService.getByPersonId(user.id),
        departmentService.getAll(),
      ]);
      setDepartments(allDepartments);

      // Step 2: Filter cases where the user is a member of the case details.
      const userCases = allCases.filter((c) =>
        c.caseDetails?.some(
          (detail) =>
            detail.policeMembers?.includes(user.id) ||
            detail.diceMembers?.includes(user.id) ||
            detail.adminMembers?.includes(user.id)
        )
      );

      setCases(userCases);
      setReports(userReports);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, loadDashboardData]);

  const departmentMap = useMemo(
    () => new Map(departments.map((d) => [d.id, d.name])),
    [departments]
  );

  const openCaseDrawer = async (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsCaseDrawerOpen(true);
    try {
      const teamFormation = await teamFormationService.getByCaseId(caseItem.id);
      if (teamFormation?.member_ids) {
        const memberPromises = teamFormation.member_ids.map((id) =>
          personService.getById(id)
        );
        const memberDetails = await Promise.all(memberPromises);
        setSelectedCaseTeam(memberDetails);
      }
    } catch (error) {
      console.error("Could not fetch team for case:", error);
      setSelectedCaseTeam([]);
    }
  };

  const handleSubmitReport = async () => {
    if (selectedCase && reportContent.trim() && user) {
      try {
        await reportService.create({
          caseId: selectedCase.id,
          personId: user.id,
          content: reportContent,
        });
        setReportContent("");
        await loadDashboardData();
      } catch (error) {
        console.error("Error submitting report:", error);
      }
    }
  };

  const handleUpdateReport = async () => {
    if (editingReport) {
      try {
        await reportService.update(editingReport.id, {
          content: editingReport.content,
        });
        setEditingReport(null);
        await loadDashboardData();
      } catch (error) {
        console.error("Error updating report:", error);
      }
    }
  };

  const activeCases = cases.filter(
    (c) => c.status === "INVESTIGATING" || c.status === "active"
  );
  const pendingCases = cases.filter(
    (c) => c.status === "REPORTED" || c.status === "pending"
  );
  const resolvedCases = cases.filter(
    (c) => c.status === "CLOSED" || c.status === "resolved"
  );

  const sidebarItems = [
    {
      id: "active",
      label: "Active Cases",
      icon: AlertCircle,
      count: activeCases.length,
      color: "text-red-600",
    },
    {
      id: "pending",
      label: "Pending Cases",
      icon: Clock,
      count: pendingCases.length,
      color: "text-yellow-600",
    },
    {
      id: "resolved",
      label: "Resolved Cases",
      icon: CheckCircle,
      count: resolvedCases.length,
      color: "text-green-600",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      count: 0,
      color: "text-blue-600",
    },
  ];

  const Sidebar = (
    <nav className="p-4">
      <div className="space-y-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() =>
              item.id === "profile"
                ? setIsProfileDrawerOpen(true)
                : setActiveTab(item.id)
            }
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === item.id && item.id !== "profile"
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${item.color}`} />
              {item.label}
            </div>
            {item.count > 0 && <Badge variant="secondary">{item.count}</Badge>}
          </button>
        ))}
      </div>
    </nav>
  );

  const getCurrentCases = () => {
    if (activeTab === "active") return activeCases;
    if (activeTab === "pending") return pendingCases;
    if (activeTab === "resolved") return resolvedCases;
    return [];
  };

  if (loading) {
    return (
      <DashboardLayout title="Personnel Dashboard" sidebar={Sidebar}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Personnel Dashboard" sidebar={Sidebar}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold capitalize">{activeTab} Cases</h2>
          <div className="text-sm text-gray-500">
            Department:{" "}
            <Badge>
              {user?.departmentId
                ? departmentMap.get(user.departmentId)
                : "N/A"}
            </Badge>
          </div>
        </div>
        <div className="grid gap-4">
          {getCurrentCases().map((case_) => (
            <Card key={case_.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {case_.complainantName}
                  </h3>
                  <p className="text-gray-600 mb-3">{case_.description}</p>
                  <Badge variant="outline">{case_.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab === "pending" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        alert(`Withdraw request for case ${case_.id}`)
                      }
                    >
                      <ShieldQuestion className="h-4 w-4 mr-1" /> Withdraw
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCaseDrawer(case_)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {getCurrentCases().length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No {activeTab} cases found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Drawer
        direction="right"
        open={isProfileDrawerOpen}
        onOpenChange={setIsProfileDrawerOpen}
      >
        <DrawerContent className="w-1/3 h-screen mt-0">
          <DrawerHeader className="border-b">
            <DrawerTitle>My Profile</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 space-y-6">
            {user && (
              <>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="text-2xl">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">
                      {user.firstName} {user.lastName}
                    </h3>
                    <Badge>{user.role}</Badge>
                  </div>
                </div>
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {/* --- CORRECTED: All properties now match the provided Person type --- */}
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span>{user.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>{user.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <span>
                        {user.departmentId
                          ? departmentMap.get(user.departmentId)
                          : "Not Assigned"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          <DrawerFooter className="border-t">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer
        direction="right"
        open={isCaseDrawerOpen}
        onOpenChange={setIsCaseDrawerOpen}
      >
        <DrawerContent className="w-2/3 h-screen mt-0">
          <DrawerHeader className="p-4 border-b">
            <DrawerTitle>{selectedCase?.complainantName}</DrawerTitle>
            <DrawerDescription>
              Case Details and Team Reports. Status:{" "}
              <Badge variant="outline">{selectedCase?.status}</Badge>
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-grow p-4 overflow-y-auto">
            <Tabs defaultValue="reports">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Submit Your Report</TabsTrigger>
                <TabsTrigger value="reports">View Team Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Submit Progress Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Enter your progress report..."
                      value={reportContent}
                      onChange={(e) => setReportContent(e.target.value)}
                      className="mb-2"
                      rows={8}
                    />
                    <Button onClick={handleSubmitReport} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Report
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reports" className="space-y-4 pt-4">
                {reports
                  .filter((r) => r.caseId === selectedCase?.id)
                  .map((report) => (
                    <Card key={report.id} className="bg-slate-50">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-semibold">
                            {selectedCaseTeam.find(
                              (p) => p.id === report.personId
                            )?.firstName || "Team Member"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(report.submittedAt).toLocaleDateString()}
                          </span>
                          {report.personId === user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setEditingReport(report)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {editingReport?.id === report.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingReport.content}
                              onChange={(e) =>
                                setEditingReport((r) =>
                                  r ? { ...r, content: e.target.value } : null
                                )
                              }
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleUpdateReport}>
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingReport(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700">
                            {report.content}
                          </p>
                        )}
                        {report.personId === user?.id && (
                          <div className="mt-4 border-t pt-3">
                            <h5 className="text-sm font-semibold flex items-center gap-2 mb-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              Feedback from Supervisor
                            </h5>
                            <p className="text-sm text-muted-foreground p-2 bg-white rounded border">
                              {report.sdmFeedback ||
                                "No feedback has been provided yet."}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                {reports.filter((r) => r.caseId === selectedCase?.id).length ===
                  0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No reports submitted for this case yet.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          <DrawerFooter className="border-t">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </DashboardLayout>
  );
}
