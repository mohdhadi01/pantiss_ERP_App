import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionTitles, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { PerformanceView } from '../../features/hr/components/PerformanceView';

export default function KBIMetricsScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title={hrSectionTitles['kbi-metrics']}
      subtitle={hrSectionDescriptions['kbi-metrics']}
      currentRoute="/(hr)/kbi-metrics"
      navItems={hrNavItems}
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <PerformanceView store={store} mode="kbi" />
    </ModuleShell>
  );
}
