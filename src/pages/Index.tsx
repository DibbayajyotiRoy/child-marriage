import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SuperadminDashboard } from "@/components/Dashboards/SuperadminDashboard";
import { PersonDashboard } from "@/components/Dashboards/PersonDashboard";
import { OthersDashboard } from "@/components/Dashboards/OthersDashboard";
import { LoginForm } from "@/components/Auth/LoginForm";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading state

const Index = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // While checking auth status, show a loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }
  switch (user?.role) {
    case "SUPERADMIN":
      return <SuperadminDashboard />;
    case "MEMBER":
    case "SUPERVISOR":
      return <PersonDashboard />;
    // You can add more specific roles here if needed
    default:
      return <OthersDashboard />;
  }
};

export default Index;
