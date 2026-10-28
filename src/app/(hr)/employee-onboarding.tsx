import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { OnboardingView } from '../../features/hr/components/OnboardingView';

export default function OnboardingScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title="Employee Onboarding"
      subtitle={hrSectionDescriptions['employee-onboarding']}
      badgeText="HR LEAD WORKSPACE"
      badgeColor="#3b82f6"
      currentRoute="/(hr)/employee-onboarding"
      navItems={hrNavItems}
      accentColor="#3b82f6"
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <OnboardingView store={store} />
    </ModuleShell>
  );
}
