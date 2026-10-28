import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { AttendanceView } from '../../features/hr/components/AttendanceView';

export default function AttendanceScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title="Attendance & Time"
      subtitle={hrSectionDescriptions.attendance}
      badgeText="HR LEAD WORKSPACE"
      badgeColor="#3b82f6"
      currentRoute="/(hr)/attendance"
      navItems={hrNavItems}
      accentColor="#3b82f6"
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <AttendanceView store={store} />
    </ModuleShell>
  );
}
