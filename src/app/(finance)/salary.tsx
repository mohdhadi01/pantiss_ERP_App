import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionDescriptions } from '../../features/finance/constants';
import { SalaryView } from '../../features/finance/components/SalaryView';

export default function FinanceSalaryScreen() {
  const router = useRouter();

  return (
    <ModuleShell
      title="Salary & Payroll"
      subtitle={financeSectionDescriptions.salary}
      badgeText="FINANCE CONTROLLER"
      badgeColor="#10b981"
      currentRoute="/(finance)/salary"
      navItems={financeNavItems}
      accentColor="#10b981"
      showAlerts
      unreadAlertsCount={3}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <SalaryView />
    </ModuleShell>
  );
}
