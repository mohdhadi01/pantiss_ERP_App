import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionDescriptions } from '../../features/finance/constants';
import { PaymentsView } from '../../features/finance/components/PaymentsView';

export default function PaymentsScreen() {
  const router = useRouter();

  return (
    <ModuleShell
      title="Disbursement Payments"
      subtitle={financeSectionDescriptions.payments}
      badgeText="FINANCE CONTROLLER"
      badgeColor="#10b981"
      currentRoute="/(finance)/payments"
      navItems={financeNavItems}
      accentColor="#10b981"
      showAlerts
      unreadAlertsCount={3}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <PaymentsView />
    </ModuleShell>
  );
}
