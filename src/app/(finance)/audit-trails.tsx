import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionDescriptions } from '../../features/finance/constants';
import { AuditTrailsView } from '../../features/finance/components/AuditTrailsView';

export default function AuditTrailsScreen() {
  const router = useRouter();

  return (
    <ModuleShell
      title="Audit Trails"
      subtitle={financeSectionDescriptions['audit-trails']}
      badgeText="FINANCE CONTROLLER"
      badgeColor="#10b981"
      currentRoute="/(finance)/audit-trails"
      navItems={financeNavItems}
      accentColor="#10b981"
      showAlerts
      unreadAlertsCount={3}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <AuditTrailsView />
    </ModuleShell>
  );
}
