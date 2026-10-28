import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionDescriptions } from '../../features/finance/constants';
import { ProcurementView } from '../../features/finance/components/ProcurementView';

export default function ProcurementScreen() {
  const router = useRouter();

  return (
    <ModuleShell
      title="Procurement & POs"
      subtitle={financeSectionDescriptions.procurement}
      badgeText="FINANCE CONTROLLER"
      badgeColor="#10b981"
      currentRoute="/(finance)/procurement"
      navItems={financeNavItems}
      accentColor="#10b981"
      showAlerts
      unreadAlertsCount={3}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <ProcurementView />
    </ModuleShell>
  );
}
