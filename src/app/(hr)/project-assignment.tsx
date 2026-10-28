import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { AssignmentView } from '../../features/hr/components/AssignmentView';

export default function AssignmentScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title="Project Assignment"
      subtitle={hrSectionDescriptions['project-assignment']}
      badgeText="HR LEAD WORKSPACE"
      badgeColor="#3b82f6"
      currentRoute="/(hr)/project-assignment"
      navItems={hrNavItems}
      accentColor="#3b82f6"
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <AssignmentView store={store} />
    </ModuleShell>
  );
}
