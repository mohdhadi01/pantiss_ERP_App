import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionTitles, financeSectionDescriptions } from '../../features/finance/constants';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { TaxationView } from '../../features/finance/components/TaxationView';

export default function TaxationViewScreen() {
  const router = useRouter();
  const alerts = useFinanceAlerts();

  return (
    <ModuleShell
      title={financeSectionTitles['taxation']}
      subtitle={financeSectionDescriptions['taxation']}
      currentRoute="/(finance)/taxation"
      navItems={financeNavItems}
      avatarVariant="finance"
      searchPlaceholder="Search financial records"
      showAlerts
      unreadAlertsCount={alerts.unreadCount}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <TaxationView />
    </ModuleShell>
  );
}
