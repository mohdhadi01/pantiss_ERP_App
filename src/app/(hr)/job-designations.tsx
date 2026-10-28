import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionTitles, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { DesignationsView } from '../../features/hr/components/DesignationsView';

export default function JobDesignationsScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title={hrSectionTitles['job-designations']}
      subtitle={hrSectionDescriptions['job-designations']}
      currentRoute="/(hr)/job-designations"
      navItems={hrNavItems}
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <DesignationsView store={store} />
    </ModuleShell>
  );
}
