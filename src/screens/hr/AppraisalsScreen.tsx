import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useHR } from '../../features/hr/HRContext';
import { PerformanceView } from '../../features/hr/components/PerformanceView';
import type { HrStackNav, RootDrawerNav } from '../../navigation/types';

export const AppraisalsScreen: React.FC = () => {
  const navigation = useNavigation<HrStackNav>();
  const store = useHR();

  return (
    <ModuleGate moduleId="human-resources" role="hr-manager">
      <ModuleShell
        title={"Year-end Appraisals"}
        subtitle={"Bring employee KBI assessments into a considered year-end review."}
        currentRoute="/(hr)/appraisals"
        notice={store.notice}
        error={store.error}
        onDismissNotice={() => store.setNotice('')}
        onDismissError={() => store.setError('')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <PerformanceView store={store} mode="appraisal" />
      </ModuleShell>
    </ModuleGate>
  );
};
