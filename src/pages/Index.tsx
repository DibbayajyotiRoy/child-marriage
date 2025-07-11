
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SuperadminDashboard } from '@/components/Dashboards/SuperadminDashboard';
import { PersonDashboard } from '@/components/Dashboards/PersonDashboard';
import { OthersDashboard } from '@/components/Dashboards/OthersDashboard';
import { LoginForm } from '@/components/Auth/LoginForm';

const Index = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  switch (user?.role) {
    case 'superadmin':
      return <SuperadminDashboard />;
    case 'person':
      return <PersonDashboard />;
    case 'police':
    case 'dice':
    case 'admin':
      return <OthersDashboard />;
    default:
      return <LoginForm />;
  }
};

export default Index;
