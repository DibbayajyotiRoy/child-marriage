
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useMockData } from '@/hooks/useMockData';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Clock, CheckCircle, Eye, FileText, Send } from 'lucide-react';
import { Issue } from '@/types';

export function PersonDashboard() {
  const { user } = useAuth();
  const { issues, reports } = useMockData();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [reportContent, setReportContent] = useState('');

  const userIssues = issues.filter(issue => 
    issue.assignedTo === user?.id || issue.departmentId === user?.departmentId
  );

  const activeIssues = userIssues.filter(issue => issue.status === 'active');
  const pendingIssues = userIssues.filter(issue => issue.status === 'pending');
  const resolvedIssues = userIssues.filter(issue => issue.status === 'resolved');

  const sidebarItems = [
    { id: 'active', label: 'Active Issues', icon: AlertCircle, count: activeIssues.length, color: 'text-red-600' },
    { id: 'pending', label: 'Pending Issues', icon: Clock, count: pendingIssues.length, color: 'text-yellow-600' },
    { id: 'resolved', label: 'Resolved Issues', icon: CheckCircle, count: resolvedIssues.length, color: 'text-green-600' },
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
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${item.color}`} />
              {item.label}
            </div>
            <Badge variant="secondary">{item.count}</Badge>
          </button>
        ))}
      </div>
    </nav>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-red-100 text-red-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-600 text-white">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 text-white">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-500 text-white">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-500 text-white">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getCurrentIssues = () => {
    switch (activeTab) {
      case 'active':
        return activeIssues;
      case 'pending':
        return pendingIssues;
      case 'resolved':
        return resolvedIssues;
      default:
        return activeIssues;
    }
  };

  const handleSubmitReport = () => {
    if (selectedIssue && reportContent.trim()) {
      console.log('Submitting report for issue:', selectedIssue.id);
      console.log('Report content:', reportContent);
      setReportContent('');
      // In a real app, this would make an API call
    }
  };

  const handleMarkResolved = (issueId: string) => {
    console.log('Marking issue as resolved:', issueId);
    // In a real app, this would make an API call
  };

  return (
    <DashboardLayout
      title="Department Dashboard"
      sidebar={Sidebar}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold capitalize">{activeTab} Issues</h2>
          <div className="text-sm text-gray-500">
            Department: {user?.departmentName}
          </div>
        </div>

        <div className="grid gap-4">
          {getCurrentIssues().map((issue) => (
            <Card key={issue.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{issue.title}</h3>
                      {getStatusBadge(issue.status)}
                      {getPriorityBadge(issue.priority)}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{issue.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Reported by: {issue.reportedBy}</span>
                      <span>Created: {issue.createdAt.toLocaleDateString()}</span>
                      {issue.resolvedAt && (
                        <span>Resolved: {issue.resolvedAt.toLocaleDateString()}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {issue.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{issue.title}</DialogTitle>
                          <DialogDescription>
                            Issue Details and Progress Reports
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-gray-600">{issue.description}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-1">Status</h4>
                              {getStatusBadge(issue.status)}
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">Priority</h4>
                              {getPriorityBadge(issue.priority)}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Progress Reports</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {reports
                                .filter(report => report.issueId === issue.id)
                                .map(report => (
                                  <div key={report.id} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium">{report.authorName}</span>
                                      <span className="text-xs text-gray-500">
                                        {report.createdAt.toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{report.content}</p>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Submit Progress Report</h4>
                            <Textarea
                              placeholder="Enter your progress report..."
                              value={reportContent}
                              onChange={(e) => setReportContent(e.target.value)}
                              className="mb-2"
                            />
                            <Button onClick={handleSubmitReport} className="w-full">
                              <Send className="h-4 w-4 mr-2" />
                              Submit Report
                            </Button>
                          </div>

                          {issue.status !== 'resolved' && (
                            <Button 
                              onClick={() => handleMarkResolved(issue.id)}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Resolved
                            </Button>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {issue.status !== 'resolved' && (
                      <Button 
                        size="sm"
                        onClick={() => handleMarkResolved(issue.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {getCurrentIssues().length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No {activeTab} issues found.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
