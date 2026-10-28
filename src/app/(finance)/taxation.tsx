import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionDescriptions } from '../../features/finance/constants';
import { TaxationView } from '../../features/finance/components/TaxationView';

export default function TaxationScreen() {
  const router = useRouter();

  return (
    <ModuleShell
      title="Taxation & Compliance"
      subtitle={financeSectionDescriptions.taxation}
      badgeText="FINANCE CONTROLLER"
      badgeColor="#10b981"
      currentRoute="/(finance)/taxation"
      navItems={financeNavItems}
      accentColor="#10b981"
      showAlerts
      unreadAlertsCount={3}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <TaxationView />
    </ModuleShell>
  );
}
