import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionTitles, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { AttendanceView } from '../../features/hr/components/AttendanceView';

export default function AttendanceScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title={hrSectionTitles['attendance']}
      subtitle={hrSectionDescriptions['attendance']}
      currentRoute="/(hr)/attendance"
      navItems={hrNavItems}
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <AttendanceView store={store} />
    </ModuleShell>
  );
}
