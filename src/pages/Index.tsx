import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SuperadminDashboard } from "@/components/Dashboards/SuperadminDashboard";
import { PersonDashboard } from "@/components/Dashboards/PersonDashboard";
import { SdmDashboard } from "@/components/Dashboards/SdmDashboard";
import { DmDashboard } from "@/components/Dashboards/DmDashboard";
import { SpDashboard } from "@/components/Dashboards/SpDashboard";
import { LoginForm } from "@/components/Auth/LoginForm";
import { Skeleton } from "@/components/ui/skeleton";

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

  // If the user is not authenticated, always show the login form
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Check the user's role and render the appropriate dashboard
  switch (user?.role) {
    case "SUPERADMIN":
      return <SuperadminDashboard />;

    case "MEMBER":
      return <PersonDashboard />;

    // 4. Add routing for the new roles
    case "SDM":
      return <SdmDashboard />;

    case "DM":
      return <DmDashboard />;

    case "SP":
      return <SpDashboard />;

    default:
      // This will handle any unexpected roles or logout the user
      return <LoginForm />;
  }
};

export default Index;
