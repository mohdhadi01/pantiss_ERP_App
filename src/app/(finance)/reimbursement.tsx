import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionDescriptions } from '../../features/finance/constants';
import { ReimbursementView } from '../../features/finance/components/ReimbursementView';

export default function ReimbursementScreen() {
  const router = useRouter();

  return (
    <ModuleShell
      title="Reimbursements"
      subtitle={financeSectionDescriptions.reimbursement}
      badgeText="FINANCE CONTROLLER"
      badgeColor="#10b981"
      currentRoute="/(finance)/reimbursement"
      navItems={financeNavItems}
      accentColor="#10b981"
      showAlerts
      unreadAlertsCount={3}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <ReimbursementView />
    </ModuleShell>
  );
}
