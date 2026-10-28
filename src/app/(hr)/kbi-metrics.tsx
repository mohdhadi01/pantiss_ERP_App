import React from 'react';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { hrNavItems, hrSectionDescriptions } from '../../features/hr/constants';
import { useHR } from '../../features/hr/HRContext';
import { PerformanceView } from '../../features/hr/components/PerformanceView';

export default function KBIMetricsScreen() {
  const store = useHR();

  return (
    <ModuleShell
      title="KBI Metrics"
      subtitle={hrSectionDescriptions['kbi-metrics']}
      badgeText="HR LEAD WORKSPACE"
      badgeColor="#3b82f6"
      currentRoute="/(hr)/kbi-metrics"
      navItems={hrNavItems}
      accentColor="#3b82f6"
      notice={store.notice}
      error={store.error}
      onDismissNotice={() => store.setNotice('')}
      onDismissError={() => store.setError('')}
    >
      <PerformanceView store={store} mode="kbi" />
    </ModuleShell>
  );
}
