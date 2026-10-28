import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionDescriptions } from '../../features/finance/constants';
import { BankingView } from '../../features/finance/components/BankingView';

export default function BankingScreen() {
  const router = useRouter();

  return (
    <ModuleShell
      title="Banking & Treasury"
      subtitle={financeSectionDescriptions.banking}
      badgeText="FINANCE CONTROLLER"
      badgeColor="#10b981"
      currentRoute="/(finance)/banking"
      navItems={financeNavItems}
      accentColor="#10b981"
      showAlerts
      unreadAlertsCount={3}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <BankingView />
    </ModuleShell>
  );
}
