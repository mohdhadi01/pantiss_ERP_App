import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionTitles, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { RecruitmentView } from '../../features/hr/components/RecruitmentView';

export default function RecruitmentScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title={hrSectionTitles['recruitment']}
      subtitle={hrSectionDescriptions['recruitment']}
      currentRoute="/(hr)/recruitment"
      navItems={hrNavItems}
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <RecruitmentView store={store} />
    </ModuleShell>
  );
}
