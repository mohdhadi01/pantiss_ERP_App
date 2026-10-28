import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionTitles, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { HRDashboard } from '../../features/hr/components/HRDashboard';

export default function DashboardScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title={hrSectionTitles['dashboard']}
      subtitle={hrSectionDescriptions['dashboard']}
      currentRoute="/(hr)/dashboard"
      navItems={hrNavItems}
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <HRDashboard data={store.data} />
    </ModuleShell>
  );
}
