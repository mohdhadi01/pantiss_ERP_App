import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionTitles, hrSectionDescriptions } from '../../features/hr/constants';
import { SalaryApprovalsView } from '../../features/hr/components/SalaryApprovalsView';

export default function SalaryScreen() {
  return (
    <ModuleShell
      title={hrSectionTitles['salary']}
      subtitle={hrSectionDescriptions['salary']}
      currentRoute="/(hr)/salary"
      navItems={hrNavItems}
    >
      <SalaryApprovalsView />
    </ModuleShell>
  );
}
