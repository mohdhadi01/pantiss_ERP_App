import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { RecruitmentView } from '../../features/hr/components/RecruitmentView';

export default function RecruitmentScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title="Recruitment & Hiring"
      subtitle={hrSectionDescriptions.recruitment}
      badgeText="HR LEAD WORKSPACE"
      badgeColor="#3b82f6"
      currentRoute="/(hr)/recruitment"
      navItems={hrNavItems}
      accentColor="#3b82f6"
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <RecruitmentView store={store} />
    </ModuleShell>
  );
}
