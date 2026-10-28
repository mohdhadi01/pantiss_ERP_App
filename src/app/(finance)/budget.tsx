import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionDescriptions } from '../../features/finance/constants';
import { BudgetsView } from '../../features/finance/components/BudgetsView';

export default function BudgetScreen() {
  const router = useRouter();

  return (
    <ModuleShell
      title="Annual Budgets"
      subtitle={financeSectionDescriptions.budget}
      badgeText="FINANCE CONTROLLER"
      badgeColor="#10b981"
      currentRoute="/(finance)/budget"
      navItems={financeNavItems}
      accentColor="#10b981"
      showAlerts
      unreadAlertsCount={3}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <BudgetsView />
    </ModuleShell>
  );
}
