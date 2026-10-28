import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionTitles, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { PerformanceView } from '../../features/hr/components/PerformanceView';

export default function AppraisalsScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title={hrSectionTitles['appraisals']}
      subtitle={hrSectionDescriptions['appraisals']}
      currentRoute="/(hr)/appraisals"
      navItems={hrNavItems}
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <PerformanceView store={store} mode="appraisal" />
    </ModuleShell>
  );
}
