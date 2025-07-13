
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Issue } from '@/types';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issues: Issue[];
}

export function NotificationModal({ open, onOpenChange, issues }: NotificationModalProps) {
  const getStatusIcon = (status: Issue['status']) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            All Issues ({issues.length})
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-96">
          <div className="space-y-4 pr-4">
            {issues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No issues found
              </div>
            ) : (
              issues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(issue.status)}
                        <h4 className="font-medium text-sm">{issue.title}</h4>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {issue.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>📍 {issue.location}</span>
                        <span>•</span>
                        <span>👤 Age: {issue.victimAge || 'Unknown'}</span>
                        <span>•</span>
                        <span>⚡ {issue.urgencyLevel}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getPriorityColor(issue.priority)}`}
                      >
                        {issue.priority}
                      </Badge>
                      
                      <Badge
                        variant={issue.status === 'active' ? 'destructive' : 
                                issue.status === 'resolved' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {issue.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
