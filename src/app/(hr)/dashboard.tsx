import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { HRDashboard } from '../../features/hr/components/HRDashboard';

export default function HRDashboardScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title="HR Dashboard"
      subtitle={hrSectionDescriptions.dashboard}
      badgeText="HR LEAD WORKSPACE"
      badgeColor="#3b82f6"
      currentRoute="/(hr)/dashboard"
      navItems={hrNavItems}
      accentColor="#3b82f6"
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <HRDashboard data={store.data} />
    </ModuleShell>
  );
}
