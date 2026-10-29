import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { ModuleGate } from '../../navigation/guards';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { useHR } from '../../features/hr/HRContext';
import { PerformanceView } from '../../features/hr/components/PerformanceView';
import type { HrStackNav, RootDrawerNav } from '../../navigation/types';

export const KbiMetricsScreen: React.FC = () => {
  const navigation = useNavigation<HrStackNav>();
  const store = useHR();

  return (
    <ModuleGate moduleId="human-resources" role="hr-manager">
      <ModuleShell
        title={"KBI Metrics"}
        subtitle={"Employee-wise Key Behavioural Indicators for the annual appraisal cycle."}
        currentRoute="/(hr)/kbi-metrics"
        notice={store.notice}
        error={store.error}
        onDismissNotice={() => store.setNotice('')}
        onDismissError={() => store.setError('')}
        onOpenDrawer={() => navigation.getParent<RootDrawerNav>()?.openDrawer()}
      >
        <PerformanceView store={store} mode="kbi" />
      </ModuleShell>
    </ModuleGate>
  );
};
