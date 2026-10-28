import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionTitles, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { LeaveView } from '../../features/hr/components/LeaveView';

export default function LeaveManagementScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title={hrSectionTitles['leave-management']}
      subtitle={hrSectionDescriptions['leave-management']}
      currentRoute="/(hr)/leave-management"
      navItems={hrNavItems}
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <LeaveView store={store} />
    </ModuleShell>
  );
}
