import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionTitles, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { AssignmentView } from '../../features/hr/components/AssignmentView';

export default function ProjectAssignmentScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title={hrSectionTitles['project-assignment']}
      subtitle={hrSectionDescriptions['project-assignment']}
      currentRoute="/(hr)/project-assignment"
      navItems={hrNavItems}
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <AssignmentView store={store} />
    </ModuleShell>
  );
}
