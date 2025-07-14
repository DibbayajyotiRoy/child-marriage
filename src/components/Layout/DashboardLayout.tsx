
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { NotificationModal } from '@/components/ui/notification-modal';
import { useMockData } from '@/hooks/useMockData';
import { LogOut, User, Bell } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, sidebar, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { issues } = useMockData();
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  
  // Count active and pending issues for notification badge
  const safeIssues = issues || [];
  const activeIssuesCount = safeIssues.filter(issue => 
    issue.status === 'active' || issue.status === 'pending'
  ).length;

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CM</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full hover:bg-accent/80 transition-all duration-200 hover:scale-105 relative"
              onClick={() => setNotificationModalOpen(true)}
            >
              <Bell className="h-4 w-4" />
              {activeIssuesCount > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {activeIssuesCount > 9 ? '9+' : activeIssuesCount}
                  </span>
                </div>
              )}
            </Button>
            
            <ThemeToggle />
            
            {/* User Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-border/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 px-3 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Modern Sidebar */}
        <aside className="w-64 bg-card/40 backdrop-blur-sm border-r border-border/50 min-h-[calc(100vh-5rem)] sticky top-20">
          <div className="p-4">
            {sidebar}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        open={notificationModalOpen}
        onOpenChange={setNotificationModalOpen}
        issues={safeIssues}
      />
    </div>
  );
}
