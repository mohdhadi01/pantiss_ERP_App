import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionTitles, financeSectionDescriptions } from '../../features/finance/constants';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { ProcurementView } from '../../features/finance/components/ProcurementView';

export default function ProcurementViewScreen() {
  const router = useRouter();
  const alerts = useFinanceAlerts();

  return (
    <ModuleShell
      title={financeSectionTitles['procurement']}
      subtitle={financeSectionDescriptions['procurement']}
      currentRoute="/(finance)/procurement"
      navItems={financeNavItems}
      avatarVariant="finance"
      searchPlaceholder="Search financial records"
      showAlerts
      unreadAlertsCount={alerts.unreadCount}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <ProcurementView />
    </ModuleShell>
  );
}
