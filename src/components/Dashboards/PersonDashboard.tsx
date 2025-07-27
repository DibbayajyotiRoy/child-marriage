"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  Mail,
  Phone,
  MapPin,
  Building,
  Star,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Case, Person, Report, Department, TeamFormation } from "@/types";
import { caseService } from "../../api/services/case.service";
import { reportService } from "../../api/services/report.service";
import { personService } from "../../api/services/person.service";
import { teamFormationService } from "../../api/services/team-formation.service";
import { departmentService } from "../../api/services/department.service";
import { toast } from "../ui/sonner";
import { Skeleton } from "../ui/skeleton";

// --- DATA MAPPERS ---
const mapApiCaseToStateCase = (apiCase: any): Case => {
  const details = apiCase.caseDetails?.[0];
  return {
    ...apiCase,
    complainantName: details?.girlName || "Unknown Complainant",
    description: `Case involving ${details?.girlName || "N/A"} at ${
      details?.marriageAddress || "N/A"
    }.`,
    district: details?.girlSubdivision || "Unknown District",
    caseAddress: details?.girlAddress || "No address provided",
  };
};

export function PersonDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedCaseTeam, setSelectedCaseTeam] = useState<Person[]>([]);
  const [selectedCaseReports, setSelectedCaseReports] = useState<Report[]>([]);
  const [reportContent, setReportContent] = useState("");
  const [cases, setCases] = useState<Case[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isCaseDrawerOpen, setIsCaseDrawerOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [allCasesData, allDepartments] = await Promise.all([
        caseService.getAll(),
        departmentService.getAll(),
      ]);

      const mappedCases = allCasesData.map(mapApiCaseToStateCase);
      setDepartments(allDepartments);

      // Correctly filter cases where the user is a member
      const userCases = mappedCases.filter((c) => {
        const details = c.caseDetails?.[0];
        if (!details || !details.departmentMembers) return false;

        const allMemberIds = Object.values(details.departmentMembers).flat();
        return allMemberIds.includes(user.id);
      });

      setCases(userCases);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Error Loading Data", {
        description: "Could not load dashboard data.",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  const departmentMap = useMemo(
    () => new Map(departments.map((d) => [d.id, d.name])),
    [departments]
  );

  const openCaseDrawer = async (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsCaseDrawerOpen(true);
    setReportContent("");
    setEditingReport(null);
    try {
      const [teamFormation, reportsForCase] = await Promise.all([
        teamFormationService.getByCaseId(caseItem.id).catch(() => null),
        reportService.getByCaseId(caseItem.id).catch(() => []),
      ]);
      setSelectedCaseReports(reportsForCase);
      if (teamFormation?.member_ids) {
        const memberDetails = await Promise.all(
          teamFormation.member_ids.map((id) => personService.getById(id))
        );
        setSelectedCaseTeam(memberDetails);
      }
    } catch (error) {
      console.error("Could not fetch details for case:", error);
      toast.error("Error", { description: "Could not fetch case details." });
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
        toast.success("Report Submitted", {
          description: "Your report has been submitted.",
        });
        setReportContent("");
        const reportsForCase = await reportService.getByCaseId(selectedCase.id);
        setSelectedCaseReports(reportsForCase);
      } catch (error) {
        console.error("Error submitting report:", error);
        toast.error("Submission Failed", {
          description: "Could not submit your report.",
        });
      }
    }
  };

  const handleUpdateReport = async () => {
    if (editingReport && selectedCase) {
      try {
        await reportService.update(editingReport.id, {
          content: editingReport.content,
        });
        toast.success("Report Updated", {
          description: "Your report has been updated.",
        });
        setEditingReport(null);
        const reportsForCase = await reportService.getByCaseId(selectedCase.id);
        setSelectedCaseReports(reportsForCase);
      } catch (error) {
        console.error("Error updating report:", error);
        toast.error("Update Failed", {
          description: "Could not update your report.",
        });
      }
    }
  };

  const activeCases = cases.filter((c) => c.status === "INVESTIGATING");
  const pendingCases = cases.filter((c) => c.status === "REPORTED");
  const resolvedCases = cases.filter((c) => c.status === "CLOSED");

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
        <div className="p-6">
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Personnel Dashboard" sidebar={Sidebar}>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold capitalize">{activeTab} Cases</h2>
          <div className="text-sm text-gray-500">
            Department: <Badge>{user?.officeName || "N/A"}</Badge>
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
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {case_.description}
                  </p>
                  <Badge variant="outline">{case_.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
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
        <DrawerContent className="w-full md:w-1/3 h-screen mt-0">
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
                      <span>{user.officeName || "Not Assigned"}</span>
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
        <DrawerContent className="w-full md:w-2/3 h-screen mt-0">
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
                <TabsTrigger value="submit">Submit Your Report</TabsTrigger>
                <TabsTrigger value="reports">View Team Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="submit" className="pt-4">
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
                {selectedCaseReports.map((report) => (
                  <Card
                    key={report.id}
                    className="bg-slate-50 dark:bg-slate-900"
                  >
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
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {report.content}
                        </p>
                      )}
                      {report.sdmFeedback && (
                        <div className="mt-4 border-t pt-3">
                          <h5 className="text-sm font-semibold flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            Feedback from Supervisor
                          </h5>
                          <p className="text-sm text-muted-foreground p-2 bg-white dark:bg-slate-800 rounded border">
                            {report.sdmFeedback}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {selectedCaseReports.length === 0 && (
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
