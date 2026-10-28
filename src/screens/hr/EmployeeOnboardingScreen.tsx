import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrSectionTitles, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { OnboardingView } from '../../features/hr/components/OnboardingView';
import type { HrStackNav, RootDrawerNav } from '../../navigation/types';

/** Web /hr/employee-onboarding. */
export const EmployeeOnboardingScreen: React.FC = () => {
  const navigation = useNavigation<HrStackNav>();
  const store = useHR();

  return (
    <ModuleGate moduleId="human-resources" role="hr-manager">
      <ModuleShell
        title={hrSectionTitles['employee-onboarding']}
        subtitle={hrSectionDescriptions['employee-onboarding']}
        currentRoute="/(hr)/employee-onboarding"
        notice={store.notice}
        error={store.error}
        onDismissNotice={() => store.setNotice('')}
        onDismissError={() => store.setError('')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <OnboardingView store={store} />
      </ModuleShell>
    </ModuleGate>
  );
};
