import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrSectionTitles, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { DesignationsView } from '../../features/hr/components/DesignationsView';
import type { HrStackNav, RootDrawerNav } from '../../navigation/types';

/** Web /hr/job-designations. */
export const JobDesignationsScreen: React.FC = () => {
  const navigation = useNavigation<HrStackNav>();
  const store = useHR();

  return (
    <ModuleGate moduleId="human-resources" role="hr-manager">
      <ModuleShell
        title={hrSectionTitles['job-designations']}
        subtitle={hrSectionDescriptions['job-designations']}
        currentRoute="/(hr)/job-designations"
        notice={store.notice}
        error={store.error}
        onDismissNotice={() => store.setNotice('')}
        onDismissError={() => store.setError('')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <DesignationsView store={store} />
      </ModuleShell>
    </ModuleGate>
  );
};
