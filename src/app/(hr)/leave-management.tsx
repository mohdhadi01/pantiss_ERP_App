import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { LeaveView } from '../../features/hr/components/LeaveView';

export default function LeaveManagementScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title="Leave Management"
      subtitle={hrSectionDescriptions['leave-management']}
      badgeText="HR LEAD WORKSPACE"
      badgeColor="#3b82f6"
      currentRoute="/(hr)/leave-management"
      navItems={hrNavItems}
      accentColor="#3b82f6"
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <LeaveView store={store} />
    </ModuleShell>
  );
}
