"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
// ✅ FIXED: Added Mail to the import list
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
  Phone,
  Mail,
  MapPin,
  Building,
} from "lucide-react";
import type { Case, TeamFormation, Person, Report } from "@/types";
import { caseService } from "../../api/services/case.service";
import { reportService } from "../../api/services/report.service";
import { personService } from "../../api/services/person.service";
import { teamFormationService } from "../../api/services/team-formation.service";

export function PersonDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [reportContent, setReportContent] = useState("");
  const [cases, setCases] = useState<Case[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Person | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userProfile = await personService.getById(user.id);
      setProfile(userProfile);

      const allCases = await caseService.getAll();
      const userCases = allCases.filter(
        (c) => c.departmentId === userProfile.departmentId
      );
      setCases(userCases);

      const userReports = await reportService.getByPersonId(user.id);
      setReports(userReports);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const activeCases = cases.filter((case_) => case_.status === "active");
  const pendingCases = cases.filter((case_) => case_.status === "pending");
  const resolvedCases = cases.filter((case_) => case_.status === "resolved");

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
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === item.id
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-red-100 text-red-800">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCurrentCases = () => {
    switch (activeTab) {
      case "active":
        return activeCases;
      case "pending":
        return pendingCases;
      case "resolved":
        return resolvedCases;
      default:
        return [];
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

  const handleUpdateProfile = async () => {
    if (profile) {
      try {
        const updatePayload = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
        };
        await personService.update(profile.id, updatePayload);
        setIsEditingProfile(false);
        await loadDashboardData();
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const getCaseReports = (caseId: string) =>
    reports.filter((report) => report.caseId === caseId);
  const canEditReport = (report: Report) => user && report.personId === user.id;

  if (loading) {
    return (
      <DashboardLayout title="Person Dashboard" sidebar={Sidebar}>
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
    <DashboardLayout title="Person Dashboard" sidebar={Sidebar}>
      <div className="space-y-6">
        {activeTab === "profile" && profile ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <Button
                  variant={isEditingProfile ? "outline" : "default"}
                  size="sm"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                >
                  {isEditingProfile ? (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={`/placeholder.svg`} />
                  <AvatarFallback className="text-lg">
                    {profile.firstName?.[0]}
                    {profile.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{`${profile.firstName} ${profile.lastName}`}</h3>
                  <Badge variant="outline">{profile.role}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditingProfile ? (
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) =>
                          setProfile((p) =>
                            p ? { ...p, firstName: e.target.value } : null
                          )
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{profile.firstName}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditingProfile ? (
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) =>
                          setProfile((p) =>
                            p ? { ...p, lastName: e.target.value } : null
                          )
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{profile.lastName}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditingProfile ? (
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile((p) =>
                            p ? { ...p, email: e.target.value } : null
                          )
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Department</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span>{profile.department || "Not Assigned"}</span>
                    </div>
                  </div>
                </div>
              </div>
              {isEditingProfile && (
                <div className="flex justify-end">
                  <Button onClick={handleUpdateProfile}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold capitalize">
                {activeTab} Cases
              </h2>
              <div className="text-sm text-gray-500">
                Department: {profile?.department}
              </div>
            </div>
            <div className="grid gap-4">
              {getCurrentCases().map((case_) => (
                <Card
                  key={case_.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">
                            {case_.title}
                          </h3>
                          {getStatusBadge(case_.status)}
                        </div>
                        <p className="text-gray-600 mb-3">
                          {case_.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            Created:{" "}
                            {new Date(case_.createdAt!).toLocaleDateString()}
                          </span>
                          {case_.finalReportSubmitted && (
                            <span className="text-green-600">
                              Final Report Submitted
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCase(case_)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{selectedCase?.title}</DialogTitle>
                              <DialogDescription>
                                Case Details and Team Reports
                              </DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="details" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="details">
                                  Case Details
                                </TabsTrigger>
                                <TabsTrigger value="reports">
                                  Team Reports
                                </TabsTrigger>
                              </TabsList>
                              <TabsContent
                                value="details"
                                className="space-y-4"
                              >
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Description
                                  </h4>
                                  <p className="text-gray-600">
                                    {selectedCase?.description}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-1">
                                      Status
                                    </h4>
                                    {getStatusBadge(selectedCase?.status || "")}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-1">
                                      Created
                                    </h4>
                                    <span>
                                      {selectedCase?.createdAt
                                        ? new Date(
                                            selectedCase.createdAt
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </span>
                                  </div>
                                </div>
                                {selectedCase?.status !== "resolved" && (
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Submit Progress Report
                                    </h4>
                                    <Textarea
                                      placeholder="Enter your progress report..."
                                      value={reportContent}
                                      onChange={(e) =>
                                        setReportContent(e.target.value)
                                      }
                                      className="mb-2"
                                    />
                                    <Button
                                      onClick={handleSubmitReport}
                                      className="w-full"
                                    >
                                      <Send className="h-4 w-4 mr-2" />
                                      Submit Report
                                    </Button>
                                  </div>
                                )}
                              </TabsContent>
                              <TabsContent
                                value="reports"
                                className="space-y-4"
                              >
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Team Reports
                                  </h4>
                                  <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {getCaseReports(case_.id).map((report) => (
                                      <div
                                        key={report.id}
                                        className="p-4 bg-gray-50 rounded-lg"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium">
                                              Report by Team Member
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">
                                              {new Date(
                                                report.submittedAt
                                              ).toLocaleDateString()}
                                            </span>
                                            {canEditReport(report) && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  setEditingReport(report)
                                                }
                                              >
                                                <Edit3 className="h-3 w-3" />
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                        {editingReport?.id === report.id ? (
                                          <div className="space-y-2">
                                            <Textarea
                                              value={editingReport.content}
                                              onChange={(e) =>
                                                setEditingReport((r) =>
                                                  r
                                                    ? {
                                                        ...r,
                                                        content: e.target.value,
                                                      }
                                                    : null
                                                )
                                              }
                                              rows={3}
                                            />
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                onClick={handleUpdateReport}
                                              >
                                                <Save className="h-3 w-3 mr-1" />
                                                Save
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  setEditingReport(null)
                                                }
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-sm text-gray-600">
                                            {report.content}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                    {getCaseReports(case_.id).length === 0 && (
                                      <div className="text-center py-8 text-gray-500">
                                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No reports submitted yet</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {getCurrentCases().length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No {activeTab} cases found.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
