import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionDescriptions } from '../../features/hr/constants';
import { SalaryApprovalsView } from '../../features/hr/components/SalaryApprovalsView';

export default function SalaryApprovalsScreen() {
  return (
    <ModuleShell
      title="Salary Approvals"
      subtitle={hrSectionDescriptions.salary}
      badgeText="HR LEAD WORKSPACE"
      badgeColor="#3b82f6"
      currentRoute="/(hr)/salary"
      navItems={hrNavItems}
      accentColor="#3b82f6"
    >
      <SalaryApprovalsView />
    </ModuleShell>
  );
}
