import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { DesignationsView } from '../../features/hr/components/DesignationsView';

export default function DesignationsScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title="Job Designations"
      subtitle={hrSectionDescriptions['job-designations']}
      badgeText="HR LEAD WORKSPACE"
      badgeColor="#3b82f6"
      currentRoute="/(hr)/job-designations"
      navItems={hrNavItems}
      accentColor="#3b82f6"
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <DesignationsView store={store} />
    </ModuleShell>
  );
}
