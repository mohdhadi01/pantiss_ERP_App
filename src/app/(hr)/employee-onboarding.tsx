import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionTitles, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { OnboardingView } from '../../features/hr/components/OnboardingView';

export default function EmployeeOnboardingScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title={hrSectionTitles['employee-onboarding']}
      subtitle={hrSectionDescriptions['employee-onboarding']}
      currentRoute="/(hr)/employee-onboarding"
      navItems={hrNavItems}
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <OnboardingView store={store} />
    </ModuleShell>
  );
}
